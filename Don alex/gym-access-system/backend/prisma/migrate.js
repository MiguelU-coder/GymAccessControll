const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migración de base de datos...');

  try {
    // Crear planes por defecto
    console.log('📝 Creando planes por defecto...');
    
    const planes = await prisma.plan.createMany({
      data: [
        {
          nombre: 'Plan Básico',
          duracion: 30,
          precio: 299.00,
          descripcion: 'Acceso básico al gimnasio'
        },
        {
          nombre: 'Plan Premium', 
          duracion: 30,
          precio: 499.00,
          descripcion: 'Acceso premium con todos los beneficios'
        },
        {
          nombre: 'Plan Anual',
          duracion: 365,
          precio: 2999.00,
          descripcion: 'Acceso anual con descuento especial'
        }
      ],
      skipDuplicates: true
    });
    console.log(`✅ ${planes.count} planes creados`);

    // Crear administrador por defecto
    console.log('👤 Creando administrador por defecto...');
    
    // En una aplicación real, deberías hashear la contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.administrador.upsert({
      where: { usuario: 'admin' },
      update: {},
      create: {
        usuario: 'admin',
        password: hashedPassword,
        nombre: 'Administrador Principal',
        rol: 'superadmin'
      }
    });
    console.log('✅ Administrador creado');

    console.log('🎉 Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();