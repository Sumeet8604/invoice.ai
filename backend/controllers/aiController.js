const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const PARSE_SYSTEM_PROMPT = `You turn a freelancer's plain-English description of work into a structured invoice draft.

Rules:
- Respond with ONLY valid JSON, no markdown fences, no commentary.
- Shape: { "client": { "name": string, "email": string, "address": string }, "items": [ { "description": string, "quantity": number, "rate": number } ], "notes": string, "dueInDays": number }
- Infer a sensible quantity and hourly/flat rate for each line item from context. If a rate genuinely isn't mentioned or inferable, use 0.
- Split distinct pieces of work into separate line items rather than one big line.
- If no client name is mentioned, use "New Client".
- dueInDays should default to 14 if not mentioned.
- Keep "notes" short (payment terms, thank-you note, etc.) or an empty string.`;

const REMINDER_SYSTEM_PROMPT = `You write short, polite payment reminder emails for overdue or upcoming invoices.
Respond with ONLY valid JSON, no markdown fences: { "subject": string, "body": string }
Keep the tone professional and friendly, not aggressive. Body should be plain text, 3-6 sentences, and reference the invoice number, amount due, and due date given to you.`;

async function callClaude(systemPrompt, userMessage) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set on the server.');
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) throw new Error('No text content returned from the model.');

  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// POST /api/ai/parse-invoice  { text: "..." }
exports.parseInvoiceFromText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const parsed = await callClaude(PARSE_SYSTEM_PROMPT, text);

    const dueInDays = Number.isFinite(parsed.dueInDays) ? parsed.dueInDays : 14;
    const dueDate = new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000);

    res.json({
      client: parsed.client || { name: 'New Client', email: '', address: '' },
      items: Array.isArray(parsed.items) ? parsed.items : [],
      notes: parsed.notes || '',
      dueDate,
      sourcePrompt: text,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/reminder-email  { invoiceNumber, total, dueDate, clientName }
exports.draftReminderEmail = async (req, res) => {
  try {
    const { invoiceNumber, total, dueDate, clientName } = req.body;
    if (!invoiceNumber || total === undefined) {
      return res.status(400).json({ error: 'invoiceNumber and total are required' });
    }

    const userMessage = `Invoice ${invoiceNumber} for ${clientName || 'the client'}, amount due $${Number(
      total
    ).toFixed(2)}, due date ${dueDate ? new Date(dueDate).toLocaleDateString() : 'not set'}.`;

    const draft = await callClaude(REMINDER_SYSTEM_PROMPT, userMessage);
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
