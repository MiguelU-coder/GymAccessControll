const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar acceso con huella
const registrarAcceso = async (req, res) => {
  try {
    const { huellaTemplate } = req.body;

    // Buscar usuario por huella
    const usuario = await prisma.usuario.findFirst({
      where: { huellaTemplate },
      include: {
        membresia: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Huella no reconocida',
        acceso: false
      });
    }

    // Verificar si tiene membresía activa
    const ahora = new Date();
    if (!usuario.membresia ||
      usuario.membresia.estado !== 'activa' ||
      new Date(usuario.membresia.fechaFin) < ahora) {
      return res.status(403).json({
        error: 'Membresía inactiva o vencida',
        acceso: false,
        usuario: {
          nombre: usuario.nombre,
          apellido: usuario.apellido
        }
      });
    }

    // Determinar tipo de acceso (entrada o salida)
    const ultimoAcceso = await prisma.acceso.findFirst({
      where: { usuarioId: usuario.id },
      orderBy: { fechaHora: 'desc' }
    });

    const tipo = !ultimoAcceso || ultimoAcceso.tipo === 'salida'
      ? 'entrada'
      : 'salida';

    // Registrar acceso
    const acceso = await prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        tipo
      }
    });

    res.json({
      acceso: true,
      tipo,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        foto: usuario.foto,
        plan: usuario.membresia.plan.nombre
      },
      timestamp: acceso.fechaHora
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener historial de accesos
const obtenerHistorial = async (req, res) => {
  try {
    const { fecha, usuarioId } = req.query;

    let where = {};

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.fechaHora = {
        gte: fechaInicio,
        lte: fechaFin
      };
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const accesos = await prisma.acceso.findMany({
      where,
      include: {
        usuario: true
      },
      orderBy: {
        fechaHora: 'desc'
      }
    });

    res.json(accesos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarAcceso,
  obtenerHistorial
};
