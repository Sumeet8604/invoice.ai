import './InvoiceList.css';

function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export default function InvoiceList({ invoices, activeId, onSelect, onDelete }) {
  if (invoices.length === 0) {
    return (
      <section className="invoice-list">
        <p className="list-heading">Saved invoices</p>
        <p className="list-empty">Nothing saved yet — your invoices will show up here.</p>
      </section>
    );
  }

  return (
    <section className="invoice-list">
      <p className="list-heading">Saved invoices ({invoices.length})</p>
      <ul>
        {invoices.map((inv) => (
          <li
            key={inv._id}
            className={`list-row ${inv._id === activeId ? 'list-row-active' : ''}`}
          >
            <button className="list-row-main" onClick={() => onSelect(inv)}>
              <span className="list-row-number">{inv.invoiceNumber}</span>
              <span className="list-row-client">{inv.client.name}</span>
              <span className="list-row-status" data-status={inv.status}>
                {inv.status}
              </span>
              <span className="list-row-total">{money(inv.total)}</span>
            </button>
            <button
              className="list-row-delete"
              onClick={() => onDelete(inv._id)}
              aria-label={`Delete invoice ${inv.invoiceNumber}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
