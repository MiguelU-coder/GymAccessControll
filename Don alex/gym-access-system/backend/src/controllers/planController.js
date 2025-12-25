const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listarPlanes = async (req, res) => {
  try {
    const planes = await prisma.plan.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(planes);
  } catch (error) {
    console.error('❌ Error al listar planes:', error);
    res.status(500).json({ error: error.message });
  }
};

const crearPlan = async (req, res) => {
  try {
    const { nombre, duracion, precio, descripcion } = req.body;

    // Validaciones
    if (!nombre || !duracion || !precio) {
      return res.status(400).json({ 
        error: 'Nombre, duración y precio son obligatorios' 
      });
    }

    // Convertir a números
    const duracionNum = parseInt(duracion);
    const precioNum = parseFloat(precio);

    // Validar números
    if (isNaN(duracionNum) || duracionNum <= 0) {
      return res.status(400).json({ 
        error: 'La duración debe ser un número positivo' 
      });
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({ 
        error: 'El precio debe ser un número positivo' 
      });
    }

    console.log('📝 Creando plan:', { nombre, duracion: duracionNum, precio: precioNum });

    const plan = await prisma.plan.create({
      data: {
        nombre: nombre.trim(),
        duracion: duracionNum,
        precio: precioNum,
        descripcion: descripcion ? descripcion.trim() : null,
        activo: true
      }
    });

    console.log('✅ Plan creado:', plan.id);
    res.status(201).json(plan);
  } catch (error) {
    console.error('❌ Error al crear plan:', error);
    res.status(500).json({ error: error.message });
  }
};

const actualizarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, duracion, precio, descripcion, activo } = req.body;

    // CONVERTIR ID A NÚMERO
    const planId = parseInt(id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'ID de plan inválido' });
    }

    const datos = {};
    
    if (nombre !== undefined) datos.nombre = nombre.trim();
    if (duracion !== undefined) {
      const duracionNum = parseInt(duracion);
      if (isNaN(duracionNum) || duracionNum <= 0) {
        return res.status(400).json({ error: 'La duración debe ser un número positivo' });
      }
      datos.duracion = duracionNum;
    }
    if (precio !== undefined) {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
      }
      datos.precio = precioNum;
    }
    if (descripcion !== undefined) datos.descripcion = descripcion.trim();
    if (activo !== undefined) datos.activo = activo;

    console.log('📝 Actualizando plan:', planId, datos);

    const plan = await prisma.plan.update({
      where: { id: planId }, // ← Ahora es número
      data: datos
    });

    console.log('✅ Plan actualizado:', plan.id);
    res.json(plan);
  } catch (error) {
    console.error('❌ Error al actualizar plan:', error);
    res.status(500).json({ error: error.message });
  }
};

const eliminarPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // CONVERTIR ID A NÚMERO
    const planId = parseInt(id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'ID de plan inválido' });
    }

    // Verificar si tiene membresías asociadas
    const membresiasCount = await prisma.membresia.count({
      where: { planId: planId } // ← Ahora es número
    });

    if (membresiasCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar. Hay ${membresiasCount} membresías usando este plan. Desactívalo en su lugar.` 
      });
    }

    await prisma.plan.delete({
      where: { id: planId } // ← Ahora es número
    });

    console.log('✅ Plan eliminado:', planId);
    res.json({ mensaje: 'Plan eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar plan:', error);
    res.status(500).json({ error: error.message });
  }
};

// Función adicional para obtener plan por ID
const obtenerPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // CONVERTIR ID A NÚMERO
    const planId = parseInt(id);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'ID de plan inválido' });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    res.json(plan);
  } catch (error) {
    console.error('❌ Error al obtener plan:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarPlanes,
  crearPlan,
  actualizarPlan,
  eliminarPlan,
  obtenerPlan
};