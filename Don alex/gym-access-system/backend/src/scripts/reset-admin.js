// reset-admin.js - Ejecuta: node reset-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    // Eliminar admin existente
    await prisma.administrador.deleteMany({
      where: { usuario: 'admin' }
    });

    // Crear nuevo admin
    const hashedPassword = await bcrypt.hash('admin123', 12); // Usar salt rounds 12
    
    const newAdmin = await prisma.administrador.create({
      data: {
        nombre: 'Administrador',
        usuario: 'admin',
        password: hashedPassword
      }
    });

    console.log('✅ ADMIN RESETEADO EXITOSAMENTE');
    console.log('👤 Usuario: admin');
    console.log('🔑 Contraseña: admin123');
    console.log('📝 Hash generado:', hashedPassword);

    // Verificar que funciona
    const isValid = await bcrypt.compare('admin123', hashedPassword);
    console.log('🔍 Verificación post-creación:', isValid);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();