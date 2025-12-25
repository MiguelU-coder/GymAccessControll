// fix-password.js - Ejecuta: node fix-password.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkAndFixPassword() {
  try {
    console.log('🔍 Verificando administrador...');
    
    const admin = await prisma.administrador.findUnique({
      where: { usuario: 'admin' }
    });

    console.log('📊 Admin encontrado:', admin);
    console.log('🔐 Password hash:', admin.password);
    console.log('📏 Longitud hash:', admin.password.length);

    // Probar con la contraseña que debería funcionar
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log('✅ Contraseña "admin123" válida:', isValid);

    // Si no es válida, resetear la contraseña
    if (!isValid) {
      console.log('🔄 Reseteando contraseña...');
      const newHash = await bcrypt.hash('admin123', 10);
      
      await prisma.administrador.update({
        where: { usuario: 'admin' },
        data: { password: newHash }
      });
      
      console.log('🔑 Nueva contraseña establecida: admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixPassword();