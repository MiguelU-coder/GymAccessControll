const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearMembresia = async (req, res) => {
  try {
    const { usuarioId, planId, fechaInicio } = req.body;

    // CONVERTIR IDs A NÚMEROS
    const usuarioIdNum = parseInt(usuarioId);
    const planIdNum = parseInt(planId);

    if (isNaN(usuarioIdNum) || isNaN(planIdNum)) {
      return res.status(400).json({ error: 'IDs de usuario o plan inválidos' });
    }

    // Obtener el plan
    const plan = await prisma.plan.findUnique({
      where: { id: planIdNum }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    // Calcular fecha de fin
    const inicio = new Date(fechaInicio);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracion);

    // Verificar si ya tiene una membresía
    const membresiaExistente = await prisma.membresia.findUnique({
      where: { usuarioId: usuarioIdNum }
    });

    let membresia;

    if (membresiaExistente) {
      // Actualizar membresía existente
      membresia = await prisma.membresia.update({
        where: { usuarioId: usuarioIdNum },
        data: {
          planId: planIdNum,
          fechaInicio: inicio,
          fechaFin: fin,
          estado: 'activa' // ← CAMBIADO a minúsculas
        },
        include: {
          plan: true,
          usuario: true
        }
      });
    } else {
      // Crear nueva membresía
      membresia = await prisma.membresia.create({
        data: {
          usuarioId: usuarioIdNum,
          planId: planIdNum,
          fechaInicio: inicio,
          fechaFin: fin,
          estado: 'activa' // ← CAMBIADO a minúsculas
        },
        include: {
          plan: true,
          usuario: true
        }
      });
    }

    console.log('✅ Membresía creada/actualizada:', membresia.id, 'Estado:', membresia.estado);
    res.status(201).json(membresia);
  } catch (error) {
    console.error('❌ Error al crear membresía:', error);
    res.status(500).json({ error: error.message });
  }
};

const renovarMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    // CONVERTIR IDs A NÚMEROS
    const membresiaId = parseInt(id);
    const planIdNum = planId ? parseInt(planId) : null;

    if (isNaN(membresiaId)) {
      return res.status(400).json({ error: 'ID de membresía inválido' });
    }

    const membresia = await prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: { plan: true }
    });

    if (!membresia) {
      return res.status(404).json({ error: 'Membresía no encontrada' });
    }

    const plan = planIdNum ? await prisma.plan.findUnique({ 
      where: { id: planIdNum }
    }) : membresia.plan;

    // La nueva fecha de inicio es la fecha de fin actual
    const inicio = new Date(membresia.fechaFin);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracion);

    const membresiaActualizada = await prisma.membresia.update({
      where: { id: membresiaId },
      data: {
        planId: plan.id,
        fechaInicio: inicio,
        fechaFin: fin,
        estado: 'activa' // ← CAMBIADO a minúsculas
      },
      include: {
        plan: true,
        usuario: true
      }
    });

    console.log('✅ Membresía renovada:', membresiaActualizada.id, 'Estado:', membresiaActualizada.estado);
    res.json(membresiaActualizada);
  } catch (error) {
    console.error('❌ Error al renovar membresía:', error);
    res.status(500).json({ error: error.message });
  }
};

const suspenderMembresia = async (req, res) => {
  try {
    const { id } = req.params;

    // CONVERTIR ID A NÚMERO
    const membresiaId = parseInt(id);

    if (isNaN(membresiaId)) {
      return res.status(400).json({ error: 'ID de membresía inválido' });
    }

    const membresia = await prisma.membresia.update({
      where: { id: membresiaId },
      data: { estado: 'suspendida' }, // ← CAMBIADO a minúsculas
      include: {
        plan: true,
        usuario: true
      }
    });

    console.log('✅ Membresía suspendida:', membresia.id, 'Estado:', membresia.estado);
    res.json(membresia);
  } catch (error) {
    console.error('❌ Error al suspender membresía:', error);
    res.status(500).json({ error: error.message });
  }
};

// Función adicional para corregir estados existentes
const corregirEstadosMembresias = async (req, res) => {
  try {
    // Actualizar todas las membresías con estado incorrecto
    const resultado = await prisma.membresia.updateMany({
      where: {
        OR: [
          { estado: 'ACTIVA' },
          { estado: 'SUSPENDIDA' },
          { estado: 'INACTIVA' }
        ]
      },
      data: { 
        estado: 'activa' // Establecer todas como activas
      }
    });

    console.log('✅ Estados corregidos:', resultado.count, 'membresías actualizadas');
    res.json({ 
      message: `Estados corregidos: ${resultado.count} membresías actualizadas a "activa"`,
      count: resultado.count
    });
  } catch (error) {
    console.error('❌ Error al corregir estados:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearMembresia,
  renovarMembresia,
  suspenderMembresia,
  corregirEstadosMembresias
};