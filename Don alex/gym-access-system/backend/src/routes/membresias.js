const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  crearMembresia,
  renovarMembresia,
  suspenderMembresia
} = require('../controllers/membresiaController');

router.post('/', authMiddleware, crearMembresia);
router.put('/:id/renovar', authMiddleware, renovarMembresia);
router.put('/:id/suspender', authMiddleware, suspenderMembresia);

module.exports = router;