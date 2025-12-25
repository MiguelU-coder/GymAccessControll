const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  upload
} = require('../controllers/usuarioController');

router.post('/', authMiddleware, upload.single('foto'), crearUsuario);
router.get('/', authMiddleware, listarUsuarios);
router.get('/:id', authMiddleware, obtenerUsuario);
router.put('/:id', authMiddleware, upload.single('foto'), actualizarUsuario);
router.delete('/:id', authMiddleware, eliminarUsuario);

module.exports = router;