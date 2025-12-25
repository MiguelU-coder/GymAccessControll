const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors({
  origin: ['https://tudominio.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ CORREGIDO: Importa y usa las rutas de auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Importar otras rutas
const usuarioRoutes = require('./routes/usuarios');
const planRoutes = require('./routes/planes');
const accesoRoutes = require('./routes/accesos');
const membresiaRoutes = require('./routes/membresias');
const reporteRoutes = require('./routes/reportes');
const dashboardRoutes = require('./routes/dashboard');

// ✅ CORREGIDO: Asegúrate de importar el middleware
const authMiddleware = require('./middleware/auth');

// Rutas protegidas
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/planes', authMiddleware, planRoutes);
app.use('/api/accesos', authMiddleware, accesoRoutes);
app.use('/api/membresias', authMiddleware, membresiaRoutes);
app.use('/api/reportes', authMiddleware, reporteRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Ruta pública de health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MINDO FITNESS API - Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('✅ Login disponible en: POST /api/auth/login');
});