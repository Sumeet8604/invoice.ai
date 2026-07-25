# Ledger — AI-Powered Invoice Generator (MERN)

Describe your work in plain English, and Claude drafts a structured invoice —
client, line items, quantities, rates, and due date — which you review, edit,
save, and export as a PDF.

## Stack
- **M**ongoDB (Mongoose) — invoice storage
- **E**xpress — REST API
- **R**eact (Vite) — frontend
- **N**ode.js — server runtime
- **Claude API (Anthropic)** — natural-language invoice parsing + reminder emails

## Project structure
```
invoice-ai/
├── backend/
│   ├── controllers/       # invoiceController.js, aiController.js
│   ├── models/             # Invoice.js (Mongoose schema)
│   ├── routes/              # invoices.js, ai.js
│   ├── utils/generatePdf.js # PDF export with pdfkit
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js
    │   ├── components/     # AIComposer, InvoiceForm, InvoicePreview, InvoiceList
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGO_URI` — point at a local MongoDB instance or an Atlas connection string
- `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com
- `ANTHROPIC_MODEL` — check https://docs.claude.com for the current model name before deploying
- `BUSINESS_NAME` / `BUSINESS_EMAIL` — shown on generated PDFs

Start MongoDB locally if needed (`mongod`), then:
```bash
npm run dev
```
The API runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs on `http://localhost:5173` and proxies `/api` requests to the backend.

## How the AI feature works
1. You type something like: *"Redesigned the logo for Marlowe Coffee, 6 hours
   at $85/hr, plus 2 rounds of revisions at $60 flat each. Net 14 payment terms."*
2. The frontend posts that text to `POST /api/ai/parse-invoice`.
3. The backend sends it to the Claude API with a system prompt that instructs
   the model to return strict JSON: client info, itemized line items with
   inferred quantities/rates, notes, and a due date offset.
4. The response pre-fills the invoice form — you can edit anything before saving.

There's a second AI endpoint, `POST /api/ai/reminder-email`, that drafts a
short payment-reminder email for a given invoice (subject + body) — wire a
button to it in `InvoicePreview.jsx` if you want that in the UI too.

## API reference

| Method | Route                      | Description                          |
|--------|----------------------------|---------------------------------------|
| GET    | `/api/invoices`            | List invoices (optional `?status=`)   |
| POST   | `/api/invoices`            | Create an invoice                     |
| GET    | `/api/invoices/:id`        | Get one invoice                       |
| PUT    | `/api/invoices/:id`        | Update an invoice                     |
| DELETE | `/api/invoices/:id`        | Delete an invoice                     |
| GET    | `/api/invoices/:id/pdf`    | Download invoice as PDF               |
| POST   | `/api/ai/parse-invoice`    | `{ text }` → structured invoice draft |
| POST   | `/api/ai/reminder-email`   | `{ invoiceNumber, total, dueDate, clientName }` → `{ subject, body }` |

## Notes / next steps
- No auth is included — add JWT or session auth before deploying publicly,
  since anyone with API access can currently read/write all invoices.
- Client records are embedded in each invoice rather than a separate
  collection; split them out if you need a client directory or repeat-client
  analytics.
- The status field (`draft` / `sent` / `paid` / `overdue`) is manual — wire up
  a cron job or scheduled check if you want automatic overdue detection.
