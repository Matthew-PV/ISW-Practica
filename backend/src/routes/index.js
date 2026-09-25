const express = require('express');

const router = express.Router();

// Comprobación de que el servidor responde
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
