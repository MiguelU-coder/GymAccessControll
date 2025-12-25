const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    console.log('🔑 Intento de login para:', usuario);

    // Validar campos requeridos
    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar administrador por usuario
    const admin = await prisma.administrador.findUnique({
      where: { usuario: usuario }
    });

    if (!admin) {
      console.log('❌ Usuario no encontrado:', usuario);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, admin.password);
    
    if (!passwordValido) {
      console.log('❌ Contraseña incorrecta para:', usuario);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Login exitoso para:', usuario);

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        usuario: admin.usuario,
        nombre: admin.nombre
      },
      process.env.JWT_SECRET || 'secreto-temporal-backup',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token: token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        usuario: admin.usuario
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
