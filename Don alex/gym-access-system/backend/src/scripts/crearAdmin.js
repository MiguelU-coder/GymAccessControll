const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function crearAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Conectando a PostgreSQL...');
    
    const existe = await prisma.administrador.findFirst({
      where: { usuario: 'admin' }
    });
    
    if (existe) {
      console.log('El administrador ya existe');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.administrador.create({
      data: {
        nombre: 'Administrador',
        usuario: 'admin',
        password: hashedPassword
      }
    });

    console.log('ADMIN CREADO EXITOSAMENTE!');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

crearAdmin();