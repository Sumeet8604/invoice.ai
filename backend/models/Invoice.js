const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    client: {
      name: { type: String, required: true },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: { type: [LineItemSchema], default: [] },
    notes: { type: String, default: '' },
    taxRate: { type: Number, default: 0 }, // percent, e.g. 8.5
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft',
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    sourcePrompt: { type: String, default: '' }, // the raw text the AI parsed, if any
  },
  { timestamps: true }
);

InvoiceSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
});

InvoiceSchema.virtual('taxAmount').get(function () {
  return this.subtotal * (this.taxRate / 100);
});

InvoiceSchema.virtual('total').get(function () {
  return this.subtotal + this.taxAmount;
});

InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
