const express = require('express');
const router = express.Router();
const { obtenerEstadisticasDashboard } = require('../controllers/dashboardController');

// Ruta para obtener estadísticas del dashboard
router.get('/estadisticas', obtenerEstadisticasDashboard);

module.exports = router;