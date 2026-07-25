import './InvoicePreview.css';

function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export default function InvoicePreview({ invoice, onSave, onDownload, saving }) {
  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
  const total = subtotal + taxAmount;

  return (
    <aside className="preview-column">
      <div className="receipt">
        <div className="receipt-edge receipt-edge-top" aria-hidden="true" />
        <div className="receipt-body">
          <header className="receipt-header">
            <p className="receipt-eyebrow">INVOICE</p>
            <h2 className="receipt-number">{invoice.invoiceNumber || 'DRAFT'}</h2>
            <p className="receipt-status" data-status={invoice.status}>
              {invoice.status}
            </p>
          </header>

          <div className="receipt-meta">
            <div>
              <p className="meta-label">Bill to</p>
              <p className="meta-value">{invoice.client.name || '—'}</p>
              {invoice.client.email && <p className="meta-sub">{invoice.client.email}</p>}
            </div>
            <div className="meta-right">
              <p className="meta-label">Due</p>
              <p className="meta-value">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <div className="receipt-rule" aria-hidden="true" />

          <table className="receipt-table">
            <tbody>
              {invoice.items.length === 0 && (
                <tr>
                  <td colSpan={2} className="receipt-empty">
                    No line items yet
                  </td>
                </tr>
              )}
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className="item-line-desc">{item.description || 'Untitled item'}</span>
                    <span className="item-line-sub">
                      {item.quantity} × {money(item.rate)}
                    </span>
                  </td>
                  <td className="receipt-amount">{money(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-rule" aria-hidden="true" />

          <div className="receipt-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="totals-row">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>{money(taxAmount)}</span>
              </div>
            )}
            <div className="totals-row totals-final">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <>
              <div className="receipt-rule" aria-hidden="true" />
              <p className="receipt-notes">{invoice.notes}</p>
            </>
          )}
        </div>
        <div className="receipt-edge receipt-edge-bottom" aria-hidden="true" />
      </div>

      <div className="preview-actions">
        <button className="btn-secondary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : invoice._id ? 'Save changes' : 'Save invoice'}
        </button>
        <button className="btn-primary" onClick={onDownload} disabled={!invoice._id}>
          Download PDF
        </button>
      </div>
      {!invoice._id && (
        <p className="preview-hint">Save the invoice first to enable PDF export.</p>
      )}
    </aside>
  );
}
