const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  registrarAcceso,
  obtenerHistorial
} = require('../controllers/accesoController');

router.post('/registrar', registrarAcceso);
router.get('/historial', authMiddleware, obtenerHistorial);

module.exports = router;