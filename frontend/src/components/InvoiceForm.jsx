import './InvoiceForm.css';

function emptyItem() {
  return { description: '', quantity: 1, rate: 0 };
}

export default function InvoiceForm({ invoice, onChange }) {
  function set(path, value) {
    onChange((prev) => {
      const next = structuredClone(prev);
      let target = next;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
      target[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updateItem(index, field, value) {
    onChange((prev) => {
      const next = structuredClone(prev);
      next.items[index][field] = field === 'description' ? value : Number(value);
      return next;
    });
  }

  function addItem() {
    onChange((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index) {
    onChange((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  return (
    <section className="invoice-form" aria-label="Edit invoice details">
      <div className="form-grid">
        <label className="field">
          <span>Client name</span>
          <input
            value={invoice.client.name}
            onChange={(e) => set('client.name', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Client email</span>
          <input
            type="email"
            value={invoice.client.email}
            onChange={(e) => set('client.email', e.target.value)}
          />
        </label>
        <label className="field field-wide">
          <span>Client address</span>
          <input
            value={invoice.client.address}
            onChange={(e) => set('client.address', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Due date</span>
          <input
            type="date"
            value={invoice.dueDate ? invoice.dueDate.slice(0, 10) : ''}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Tax rate (%)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={invoice.taxRate}
            onChange={(e) => set('taxRate', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="items-block">
        <div className="items-header">
          <span>Line items</span>
          <button type="button" className="add-item-btn" onClick={addItem}>
            + Add line
          </button>
        </div>
        {invoice.items.map((item, i) => (
          <div className="item-row" key={i}>
            <input
              className="item-desc"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
            />
            <input
              className="item-qty"
              type="number"
              min="0"
              step="0.25"
              value={item.quantity}
              onChange={(e) => updateItem(i, 'quantity', e.target.value)}
            />
            <input
              className="item-rate"
              type="number"
              min="0"
              step="0.01"
              value={item.rate}
              onChange={(e) => updateItem(i, 'rate', e.target.value)}
            />
            <button
              type="button"
              className="remove-item-btn"
              onClick={() => removeItem(i)}
              aria-label={`Remove line item ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        {invoice.items.length === 0 && (
          <p className="items-empty">No line items yet — add one, or draft with AI above.</p>
        )}
      </div>

      <label className="field field-wide">
        <span>Notes</span>
        <textarea
          rows={2}
          value={invoice.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Payment terms, thank-you note, etc."
        />
      </label>
    </section>
  );
}
