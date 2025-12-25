const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  generarReporteAccesos,
  generarReporteUsuarios,
  generarReporteUsuarioIndividual
} = require('../controllers/reporteController');

router.get('/accesos', authMiddleware, generarReporteAccesos);
router.get('/usuarios', authMiddleware, generarReporteUsuarios);
router.get('/usuario/:id', authMiddleware, generarReporteUsuarioIndividual);

module.exports = router;