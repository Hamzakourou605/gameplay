import React from "react";

// Each inventory item: { id, icon, name, detail }
export default function InventoryPanel({ items }) {
  return (
    <div className="inventory-panel">
      <div className="inventory-title">Inventaire</div>
      {items.length === 0 && (
        <div className="inventory-empty">Aucun objet collecté.</div>
      )}
      {items.map(item => (
        <div key={item.id} className="inventory-item">
          <div className="inventory-item-icon">{item.icon}</div>
          <div className="inventory-item-info">
            <div className="inventory-item-name">{item.name}</div>
            {item.detail && <div className="inventory-item-detail">{item.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
