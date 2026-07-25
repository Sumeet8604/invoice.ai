const BASE = '/api';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  parseInvoice: (text) =>
    fetch(`${BASE}/ai/parse-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(handle),

  draftReminder: (payload) =>
    fetch(`${BASE}/ai/reminder-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),

  listInvoices: () => fetch(`${BASE}/invoices`).then(handle),

  createInvoice: (payload) =>
    fetch(`${BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),

  updateInvoice: (id, payload) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),

  deleteInvoice: (id) =>
    fetch(`${BASE}/invoices/${id}`, { method: 'DELETE' }).then(handle),

  pdfUrl: (id) => `${BASE}/invoices/${id}/pdf`,
};
