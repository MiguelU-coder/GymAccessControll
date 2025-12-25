// src/controllers/dashboardController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard...');

    // Fechas para hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    // Consultas principales
    const [
      totalUsuarios,
      usuariosActivos,
      accesosHoy,
      membresiasPorVencer
    ] = await Promise.all([
      // Total de usuarios
      prisma.usuario.count(),
      
      // Usuarios con membresía activa
      prisma.membresia.count({
        where: {
          estado: 'activa',
          fechaFin: { gte: new Date() }
        }
      }),

      // Accesos de hoy
      prisma.acceso.count({
        where: {
          fechaHora: { gte: hoy, lt: mañana }
        }
      }),

      // Membresías por vencer (7 días)
      prisma.membresia.count({
        where: {
          estado: 'activa',
          fechaFin: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Últimos accesos de hoy
    const ultimosAccesos = await prisma.acceso.findMany({
      where: {
        fechaHora: { gte: hoy, lt: mañana }
      },
      take: 5,
      orderBy: { fechaHora: 'desc' },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true }
        }
      }
    });

    // Membresías por vencer (detalles)
    const proxVencimiento = await prisma.membresia.findMany({
      where: {
        estado: 'activa',
        fechaFin: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true }
        },
        plan: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaFin: 'asc' }
    });

    // Datos para gráfico de últimos 7 días
    const accesosUltimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      
      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

      const count = await prisma.acceso.count({
        where: {
          fechaHora: {
            gte: fecha,
            lt: fechaSiguiente
          }
        }
      });

      accesosUltimos7Dias.push({
        fecha: fecha.toISOString().split('T')[0],
        count: count
      });
    }

    const responseData = {
      metrics: {
        totalUsuarios,
        usuariosActivos,
        accesosHoy,
        membresiasPorVencer
      },
      lists: {
        ultimosAccesos,
        proxVencimiento
      },
      charts: {
        accesosUltimos7Dias
      }
    };

    console.log('✅ Dashboard enviado:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Error en dashboard:', error);
    res.status(500).json({ 
      error: 'Error al cargar estadísticas',
      details: error.message 
    });
  }
};

module.exports = {
  obtenerEstadisticasDashboard
};