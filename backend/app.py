"""
Backend Flask - Chapitre 1 / Mission 1 : "Le message"
Sauvegarde la progression du joueur (objets examinés, indices, mission terminée)
dans MongoDB Atlas.
"""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB = os.getenv("MONGODB_DB", "disparition_game")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))

app = Flask(__name__)
CORS(app)  # autorise le front React (localhost:3000 / 5173) à appeler l'API

# --- Connexion MongoDB Atlas -------------------------------------------------
client = None
db = None
mongo_error = None

if MONGODB_URI:
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")  # vérifie la connexion tout de suite
        db = client[MONGODB_DB]
    except PyMongoError as exc:
        mongo_error = str(exc)
else:
    mongo_error = "MONGODB_URI n'est pas défini (voir .env.example)."

progress_collection = db["progress"] if db is not None else None
clues_collection = db["clues"] if db is not None else None

DEFAULT_STATE = {
    "chapter": 1,
    "mission": 1,
    "mission_title": "Le message",
    "examined_objects": [],   # ex: ["laptop", "radio", "feuille", "photo", "carnet"]
    "phone_found": False,
    "message_read": False,
    "mission_completed": False,
    "next_mission_unlocked": None,
    "clues": [],
    "updated_at": None,
}


def get_player_id():
    """Récupère l'id joueur depuis la query string, sinon un id par défaut."""
    return request.args.get("player_id") or (request.json or {}).get("player_id") or "yanis_default"


def serialize(doc):
    if not doc:
        return None
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok" if db is not None else "degraded",
        "mongo_connected": db is not None,
        "mongo_error": mongo_error,
    })


@app.route("/api/state", methods=["GET"])
def get_state():
    """Renvoie l'état sauvegardé de la Mission 1 pour un joueur (ou l'état par défaut)."""
    player_id = get_player_id()

    if progress_collection is None:
        return jsonify({**DEFAULT_STATE, "player_id": player_id, "warning": mongo_error}), 200

    doc = progress_collection.find_one({"player_id": player_id})
    if not doc:
        new_doc = {**DEFAULT_STATE, "player_id": player_id}
        progress_collection.insert_one(new_doc)
        return jsonify(serialize(new_doc)), 200

    return jsonify(serialize(doc)), 200


@app.route("/api/state", methods=["POST"])
def save_state():
    """
    Met à jour l'état de progression du joueur.
    Body JSON attendu, ex:
    {
      "player_id": "yanis_default",
      "examined_objects": ["laptop", "radio"],
      "phone_found": true,
      "message_read": true,
      "mission_completed": true,
      "next_mission_unlocked": "Mission 2 - Le carnet"
    }
    """
    payload = request.get_json(force=True) or {}
    player_id = payload.get("player_id", "yanis_default")
    payload["player_id"] = player_id
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    if progress_collection is None:
        return jsonify({"error": "MongoDB non connecté", "detail": mongo_error}), 503

    progress_collection.update_one(
        {"player_id": player_id},
        {"$set": payload},
        upsert=True,
    )
    doc = progress_collection.find_one({"player_id": player_id})
    return jsonify(serialize(doc)), 200


@app.route("/api/clue", methods=["POST"])
def add_clue():
    """
    Ajoute un indice (ex: la localisation "Café Nova - 21:30") à la fois
    dans la collection 'clues' et dans le tableau 'clues' du document de progression.
    Body JSON attendu:
    { "player_id": "...", "type": "location", "title": "Café Nova", "detail": "21:30" }
    """
    payload = request.get_json(force=True) or {}
    player_id = payload.get("player_id", "yanis_default")
    clue = {
        "player_id": player_id,
        "type": payload.get("type", "generic"),
        "title": payload.get("title", ""),
        "detail": payload.get("detail", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if clues_collection is None or progress_collection is None:
        return jsonify({"error": "MongoDB non connecté", "detail": mongo_error}), 503

    clues_collection.insert_one(dict(clue))
    progress_collection.update_one(
        {"player_id": player_id},
        {"$push": {"clues": clue}},
        upsert=True,
    )
    return jsonify(serialize(clue)), 201


@app.route("/api/reset", methods=["POST"])
def reset_progress():
    """Réinitialise la progression d'un joueur (utile pour retester la mission)."""
    payload = request.get_json(force=True) or {}
    player_id = payload.get("player_id", "yanis_default")

    if progress_collection is None:
        return jsonify({"error": "MongoDB non connecté", "detail": mongo_error}), 503

    progress_collection.update_one(
        {"player_id": player_id},
        {"$set": {**DEFAULT_STATE, "player_id": player_id}},
        upsert=True,
    )
    return jsonify({"reset": True, "player_id": player_id}), 200


if __name__ == "__main__":
    app.run(debug=True, port=FLASK_PORT)
