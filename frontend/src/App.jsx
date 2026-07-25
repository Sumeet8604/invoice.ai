import { useEffect, useState } from 'react';
import AIComposer from './components/AIComposer';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import InvoiceList from './components/InvoiceList';
import { api } from './api/client';
import './App.css';

function blankInvoice() {
  return {
    invoiceNumber: '',
    client: { name: '', email: '', address: '' },
    items: [],
    notes: '',
    taxRate: 0,
    status: 'draft',
    dueDate: '',
  };
}

export default function App() {
  const [invoice, setInvoice] = useState(blankInvoice());
  const [invoices, setInvoices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    refreshList();
  }, []);

  async function refreshList() {
    try {
      const list = await api.listInvoices();
      setInvoices(list);
    } catch (err) {
      // Backend may not be running yet during first setup - fail quietly in the UI.
      console.error(err);
    }
  }

  function handleDraft(draft) {
    setInvoice((prev) => ({
      ...prev,
      client: { ...prev.client, ...draft.client },
      items: draft.items.length ? draft.items : prev.items,
      notes: draft.notes || prev.notes,
      dueDate: draft.dueDate,
      sourcePrompt: draft.sourcePrompt,
    }));
    setBanner('Draft ready below — review before saving.');
    setTimeout(() => setBanner(''), 4000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...invoice };
      let saved;
      if (invoice._id) {
        saved = await api.updateInvoice(invoice._id, payload);
      } else {
        saved = await api.createInvoice(payload);
      }
      setInvoice(saved);
      await refreshList();
    } catch (err) {
      setBanner(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDownload() {
    if (!invoice._id) return;
    window.open(api.pdfUrl(invoice._id), '_blank');
  }

  function handleSelect(inv) {
    setInvoice(inv);
  }

  async function handleDelete(id) {
    await api.deleteInvoice(id);
    if (invoice._id === id) setInvoice(blankInvoice());
    await refreshList();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">LEDGER</p>
          <h1 className="app-title">AI-Powered Invoice Generator</h1>
        </div>
        <button className="new-invoice-btn" onClick={() => setInvoice(blankInvoice())}>
          + New invoice
        </button>
      </header>

      {banner && <div className="app-banner">{banner}</div>}

      <main className="app-grid">
        <div className="app-left">
          <AIComposer onDraft={handleDraft} />
          <InvoiceForm invoice={invoice} onChange={setInvoice} />
          <InvoiceList
            invoices={invoices}
            activeId={invoice._id}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </div>

        <InvoicePreview
          invoice={invoice}
          onSave={handleSave}
          onDownload={handleDownload}
          saving={saving}
        />
      </main>
    </div>
  );
}
