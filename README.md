# Invoice AI

Invoice AI is a full-stack MERN app for creating, reviewing, and exporting invoices with AI assistance. You can describe an invoice in plain English, and the app uses the Anthropic API to draft a structured invoice that you can review, edit, save, and export as a PDF.

## Features
- Create and manage invoices from a simple React interface
- Use AI to parse natural-language invoice descriptions into structured form data
- Generate a PDF version of each invoice
- Draft payment reminder emails with AI
- Store invoice records in MongoDB

## Tech Stack
- MongoDB + Mongoose
- Express.js
- React + Vite
- Node.js
- Anthropic Claude API

## Project Structure
```text
invoice-ai/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

## Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- An Anthropic API key

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Update the environment variables in `.env`:
- `MONGO_URI`: your MongoDB connection string
- `ANTHROPIC_API_KEY`: your Anthropic API key
- `ANTHROPIC_MODEL`: the Claude model you want to use
- `BUSINESS_NAME` and `BUSINESS_EMAIL`: used in generated invoices and emails

Start MongoDB if needed, then run:
```bash
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## API Overview
| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create an invoice |
| GET | `/api/invoices/:id` | Get one invoice |
| PUT | `/api/invoices/:id` | Update an invoice |
| DELETE | `/api/invoices/:id` | Delete an invoice |
| GET | `/api/invoices/:id/pdf` | Download invoice as PDF |
| POST | `/api/ai/parse-invoice` | Convert natural-language text into invoice draft data |
| POST | `/api/ai/reminder-email` | Draft a reminder email for an invoice |

## Notes
- Authentication is not included yet, so this project is best suited for local development or internal use.
- The app currently stores invoice data directly in MongoDB without a separate client collection.
- Invoice status is manually managed for now.
