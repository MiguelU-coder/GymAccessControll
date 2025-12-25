const express = require('express');
const router = express.Router();
const zktecoController = require('../controllers/zktecoController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

router.post('/registrar-huella', zktecoController.registrarHuella);
router.post('/sincronizar-asistencias', zktecoController.sincronizarAsistencias);
router.get('/estado', zktecoController.obtenerEstado);
router.get('/usuarios', zktecoController.obtenerUsuariosDispositivo);
router.delete('/usuarios/:deviceUserId', zktecoController.eliminarUsuario);

module.exports = router;