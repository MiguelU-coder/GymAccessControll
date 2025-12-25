const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function crearPlanes() {
  try {
    console.log('📋 Creando planes por defecto...');

    const planes = [
      {
        nombre: 'Día',
        duracion: 1,
        precio: 6000,
        descripcion: 'Acceso por 1 día al gimnasio',
        activo: true
      },
      {
        nombre: 'Semana',
        duracion: 7,
        precio: 30000,
        descripcion: 'Acceso por 1 semana al gimnasio',
        activo: true
      },
      {
        nombre: 'Quincena',
        duracion: 15,
        precio: 40000,
        descripcion: 'Acceso por 15 días al gimnasio',
        activo: true
      },
      {
        nombre: 'Mensualidad',
        duracion: 30,
        precio: 65000,
        descripcion: 'Acceso por 1 mes al gimnasio',
        activo: true
      },
      {
        nombre: 'Mensualidad Estudiante',
        duracion: 30,
        precio: 40000,
        descripcion: 'Acceso por 1 mes al gimnasio (Descuento estudiante)',
        activo: true
      },
      {
        nombre: 'Bimestre',
        duracion: 60,
        precio: 110000,
        descripcion: 'Acceso por 2 meses al gimnasio',
        activo: true
      },
      {
        nombre: 'Trimestre',
        duracion: 90,
        precio: 165000,
        descripcion: 'Acceso por 3 meses al gimnasio',
        activo: true
      },
      {
        nombre: 'Semestre',
        duracion: 180,
        precio: 300000,
        descripcion: 'Acceso por 6 meses al gimnasio',
        activo: true
      },
      {
        nombre: 'Año',
        duracion: 365,
        precio: 580000,
        descripcion: 'Acceso por 1 año completo al gimnasio',
        activo: true
      }
    ];

    for (const planData of planes) {
      // Verificar si ya existe
      const existe = await prisma.plan.findFirst({
        where: { nombre: planData.nombre }
      });

      if (!existe) {
        const plan = await prisma.plan.create({
          data: planData
        });
        console.log(`✅ Plan creado: ${plan.nombre} - $${plan.precio.toLocaleString()}`);
      } else {
        console.log(`ℹ️  Plan ya existe: ${planData.nombre}`);
      }
    }

    console.log('\n✅ Planes creados exitosamente\n');
  } catch (error) {
    console.error('❌ Error al crear planes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearPlanes();