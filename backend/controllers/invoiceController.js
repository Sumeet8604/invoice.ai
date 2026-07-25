const Invoice = require('../models/Invoice');
const { streamInvoicePdf } = require('../utils/generatePdf');

// Generates the next sequential invoice number, e.g. INV-0001
async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments();
  return `INV-${String(count + 1).padStart(4, '0')}`;
}

exports.createInvoice = async (req, res) => {
  try {
    const invoiceNumber = req.body.invoiceNumber || (await nextInvoiceNumber());
    const invoice = await Invoice.create({ ...req.body, invoiceNumber });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    streamInvoicePdf(invoice, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
