const PDFDocument = require('pdfkit');

/**
 * Streams a PDF representation of an invoice to the given response.
 * @param {import('../models/Invoice')} invoice - a Mongoose invoice document (or plain object with virtuals)
 * @param {import('express').Response} res
 */
function streamInvoicePdf(invoice, res) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
  );
  doc.pipe(res);

  const businessName = process.env.BUSINESS_NAME || 'Your Company Name';
  const businessEmail = process.env.BUSINESS_EMAIL || '';

  // Header
  doc.fontSize(20).text(businessName, { continued: false });
  if (businessEmail) doc.fontSize(10).fillColor('gray').text(businessEmail);
  doc.moveDown(1.5);

  doc.fillColor('black').fontSize(16).text(`Invoice ${invoice.invoiceNumber}`);
  doc.fontSize(10).fillColor('gray');
  doc.text(`Issued: ${new Date(invoice.issueDate).toLocaleDateString()}`);
  if (invoice.dueDate) {
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`);
  }
  doc.text(`Status: ${invoice.status.toUpperCase()}`);
  doc.moveDown();

  // Bill to
  doc.fillColor('black').fontSize(12).text('Bill To:', { underline: true });
  doc.fontSize(11).text(invoice.client.name);
  if (invoice.client.email) doc.text(invoice.client.email);
  if (invoice.client.address) doc.text(invoice.client.address);
  doc.moveDown();

  // Table header
  const tableTop = doc.y + 10;
  const col = { desc: 50, qty: 320, rate: 390, amount: 470 };

  doc.fontSize(10).fillColor('gray');
  doc.text('Description', col.desc, tableTop);
  doc.text('Qty', col.qty, tableTop);
  doc.text('Rate', col.rate, tableTop);
  doc.text('Amount', col.amount, tableTop);
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .strokeColor('#cccccc')
    .stroke();

  let y = tableTop + 25;
  doc.fillColor('black');
  invoice.items.forEach((item) => {
    const amount = item.quantity * item.rate;
    doc.fontSize(10);
    doc.text(item.description, col.desc, y, { width: 260 });
    doc.text(String(item.quantity), col.qty, y);
    doc.text(`$${item.rate.toFixed(2)}`, col.rate, y);
    doc.text(`$${amount.toFixed(2)}`, col.amount, y);
    y += 22;
  });

  y += 10;
  doc.moveTo(320, y).lineTo(545, y).strokeColor('#cccccc').stroke();
  y += 10;

  const subtotal = invoice.subtotal ?? invoice.items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const taxAmount = invoice.taxAmount ?? subtotal * ((invoice.taxRate || 0) / 100);
  const total = invoice.total ?? subtotal + taxAmount;

  doc.fontSize(10).text('Subtotal', col.rate, y);
  doc.text(`$${subtotal.toFixed(2)}`, col.amount, y);
  y += 18;

  if (invoice.taxRate) {
    doc.text(`Tax (${invoice.taxRate}%)`, col.rate, y);
    doc.text(`$${taxAmount.toFixed(2)}`, col.amount, y);
    y += 18;
  }

  doc.fontSize(12).text('Total', col.rate, y, { bold: true });
  doc.fontSize(12).text(`$${total.toFixed(2)}`, col.amount, y);

  if (invoice.notes) {
    doc.moveDown(3);
    doc.fontSize(10).fillColor('gray').text('Notes:', { underline: true });
    doc.fillColor('black').text(invoice.notes);
  }

  doc.end();
}

module.exports = { streamInvoicePdf };
