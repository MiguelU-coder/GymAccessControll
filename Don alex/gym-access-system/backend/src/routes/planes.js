// backend/routes/planes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/planes - Obtener todos los planes activos
router.get('/', async (req, res) => {
  try {
    const planes = await prisma.plan.findMany({
      where: { estado: 'activo' },
      orderBy: { precio: 'asc' }
    });

    res.json({
      success: true,
      data: planes,
      total: planes.length
    });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los planes'
    });
  }
});

// GET /api/planes/:id - Obtener un plan por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de plan inválido'
      });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: id }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    if (plan.estado !== 'activo') {
      return res.status(404).json({
        success: false,
        error: 'Plan no disponible'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al obtener plan:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el plan'
    });
  }
});

// PUT /api/planes/:id - Actualizar un plan
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de plan inválido'
      });
    }

    const { nombre, precio, duracion, descripcion, popular, features, color } = req.body;

    console.log('📝 Actualizando plan ID:', id, req.body);
    
    // Validaciones
    if (!nombre || !precio || !duracion || !descripcion) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }

    if (precio <= 0 || duracion <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Precio y duración deben ser mayores a 0'
      });
    }

    // Verificar si el plan existe
    const planExistente = await prisma.plan.findUnique({
      where: { id: id }
    });

    if (!planExistente) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    // Actualizar plan en la base de datos
    const planActualizado = await prisma.plan.update({
      where: { id: id },
      data: {
        nombre: nombre.trim(),
        precio: Number(precio),
        duracion: Number(duracion),
        descripcion: descripcion.trim(),
        popular: Boolean(popular),
        features: Array.isArray(features) ? features : [],
        color: color || '#4f46e5',
        actualizado: new Date()
      }
    });

    console.log('✅ Plan actualizado:', planActualizado.nombre);

    res.json({
      success: true,
      data: planActualizado,
      message: 'Plan actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar plan:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar el plan'
    });
  }
});

// POST /api/planes - Crear nuevo plan
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, duracion, descripcion, popular, features, color } = req.body;
    
    console.log('🆕 Creando nuevo plan:', nombre);
    
    // Validaciones
    if (!nombre || !precio || !duracion || !descripcion) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }

    if (precio <= 0 || duracion <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Precio y duración deben ser mayores a 0'
      });
    }

    // Crear plan en la base de datos (el ID se auto-genera)
    const nuevoPlan = await prisma.plan.create({
      data: {
        nombre: nombre.trim(),
        precio: Number(precio),
        duracion: Number(duracion),
        descripcion: descripcion.trim(),
        popular: Boolean(popular),
        features: Array.isArray(features) ? features : [],
        color: color || '#4f46e5',
        estado: 'activo',
        creado: new Date(),
        actualizado: new Date()
      }
    });

    console.log('✅ Nuevo plan creado:', nuevoPlan.nombre);

    res.status(201).json({
      success: true,
      data: nuevoPlan,
      message: 'Plan creado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al crear plan:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear el plan'
    });
  }
});

// DELETE /api/planes/:id - Eliminar plan (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de plan inválido'
      });
    }

    console.log('🗑️ Eliminando plan ID:', id);

    // Verificar si el plan existe
    const planExistente = await prisma.plan.findUnique({
      where: { id: id }
    });

    if (!planExistente) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    // Soft delete - cambiar estado a inactivo
    const planEliminado = await prisma.plan.update({
      where: { id: id },
      data: {
        estado: 'inactivo',
        actualizado: new Date()
      }
    });

    console.log('✅ Plan marcado como inactivo:', planEliminado.nombre);

    res.json({
      success: true,
      message: 'Plan eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar plan:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar el plan'
    });
  }
});

// PATCH /api/planes/:id/estado - Cambiar estado del plan
router.patch('/:id/estado', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de plan inválido'
      });
    }

    const { estado } = req.body;

    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado debe ser "activo" o "inactivo"'
      });
    }

    const planActualizado = await prisma.plan.update({
      where: { id: id },
      data: {
        estado: estado,
        actualizado: new Date()
      }
    });

    res.json({
      success: true,
      data: planActualizado,
      message: `Plan ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado del plan:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/planes/seed/popular - Endpoint para popular la base de datos con planes iniciales
router.post('/seed/popular', async (req, res) => {
  try {
    const planesIniciales = [
      {
        nombre: 'Día',
        precio: 6000,
        duracion: 1,
        descripcion: 'Acceso por 1 día',
        popular: false,
        color: '#4f46e5',
        features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica']
      },
      {
        nombre: 'Semana',
        precio: 30000,
        duracion: 7,
        descripcion: 'Acceso por 1 semana',
        popular: false,
        color: '#10b981',
        features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Acceso a duchas']
      },
      {
        nombre: 'Mensual',
        precio: 65000,
        duracion: 30,
        descripcion: 'Acceso por 1 mes',
        popular: true,
        color: '#ec4899',
        features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Descuento en suplementos']
      }
    ];

    // Eliminar planes existentes (opcional)
    await prisma.plan.deleteMany({});

    // Crear planes iniciales
    const planesCreados = await prisma.plan.createMany({
      data: planesIniciales.map(plan => ({
        ...plan,
        estado: 'activo',
        creado: new Date(),
        actualizado: new Date()
      }))
    });

    res.json({
      success: true,
      message: 'Planes iniciales creados exitosamente',
      data: {
        creados: planesCreados.count
      }
    });

  } catch (error) {
    console.error('Error al popular planes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear planes iniciales'
    });
  }
});

module.exports = router;