const express = require('express');
const router = express.Router();
const { parseInvoiceFromText, draftReminderEmail } = require('../controllers/aiController');

router.post('/parse-invoice', parseInvoiceFromText);
router.post('/reminder-email', draftReminderEmail);

module.exports = router;
