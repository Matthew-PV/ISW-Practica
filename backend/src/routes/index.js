const express = require('express');

const router = express.Router();
const authRoutes = require('./auth');

router.use('/auth', authRoutes);

// Comprobación de que el servidor responde
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
