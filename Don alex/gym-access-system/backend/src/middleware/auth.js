const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    // Remover "Bearer " del token
    const tokenFormateado = token.replace('Bearer ', '');

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no configurado');
      }
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor en autenticación' });
  }
};

module.exports = authMiddleware;