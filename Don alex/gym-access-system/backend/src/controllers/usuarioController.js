const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Listar usuarios
const listarUsuarios = async (req, res) => {
  try {
    console.log('📋 Listando usuarios...');
    
    const usuarios = await prisma.usuario.findMany({
      include: {
        membresia: {
          include: {
            plan: true
          }
        }
      }
    });
    
    console.log(`✅ ${usuarios.length} usuarios encontrados`);
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear usuario
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, cedula, huellaTemplate } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nombre || !apellido || !telefono || !cedula || !huellaTemplate) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cedula }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Ya existe un usuario con esa cédula' });
    }

    if (email && email.trim() !== '') {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email: email.trim() }
      });

      if (emailExistente) {
        return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
      }
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email && email.trim() !== '' ? email.trim() : null,
        telefono: telefono.trim(),
        cedula: cedula.trim(),
        foto,
        huellaTemplate
      }
    });

    console.log('✅ Usuario creado:', usuario.id);
    res.status(201).json(usuario);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuario por ID
const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CONVERTIR id A NÚMERO
    const usuarioId = parseInt(id);
    
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }, 
      include: {
        membresia: {
          include: {
            plan: true
          }
        },
        accesos: {
          orderBy: {
            fechaHora: 'desc'
          },
          take: 10
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    
    // CONVERTIR id A NÚMERO
    const usuarioId = parseInt(id);
    
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    if (req.file) {
      datos.foto = `/uploads/${req.file.filename}`;
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId }, // ← Ahora es número
      data: datos
    });

    console.log('✅ Usuario actualizado:', usuario.id);
    res.json(usuario);
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CONVERTIR id A NÚMERO
    const usuarioId = parseInt(id);
    
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const accesos = await prisma.acceso.count({
      where: { usuarioId: usuarioId } // ← Ahora es número
    });

    if (accesos > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un usuario con accesos registrados.' 
      });
    }

    await prisma.membresia.deleteMany({
      where: { usuarioId: usuarioId } // ← Ahora es número
    });

    await prisma.usuario.delete({
      where: { id: usuarioId } // ← Ahora es número
    });

    console.log('✅ Usuario eliminado:', usuarioId);
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  upload
};