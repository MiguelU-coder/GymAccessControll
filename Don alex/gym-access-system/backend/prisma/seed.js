const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  try {
    // Hash de la contraseña
    const password = await bcrypt.hash('admin123', 10)
    console.log('🔑 Password hasheado creado')

    // Crear administrador - SOLO campos que EXISTEN
    const admin = await prisma.administrador.upsert({
      where: { usuario: 'admin' },
      update: {
        nombre: 'Administrador Principal',
        password: password,
      },
      create: {
        nombre: 'Administrador Principal',
        usuario: 'admin',
        password: password,
      },
    })

    console.log('✅ Administrador creado:', admin.usuario)

    // Crear planes de MINDO FITNESS
    const planes = await prisma.plan.createMany({
      data: [
        {
          nombre: 'Día',
          duracion: 1,
          precio: 6000,
          descripcion: 'Acceso por 1 día'
        },
        {
          nombre: 'Semana',
          duracion: 7,
          precio: 30000,
          descripcion: 'Acceso por 1 semana'
        },
        {
          nombre: 'Quincena',
          duracion: 15,
          precio: 40000,
          descripcion: 'Acceso por 15 días'
        },
        {
          nombre: 'Mensualidad',
          duracion: 30,
          precio: 65000,
          descripcion: 'Acceso por 1 mes'
        },
        {
          nombre: 'Bimestre',
          duracion: 60,
          precio: 110000,
          descripcion: 'Acceso por 2 meses'
        },
        {
          nombre: 'Trimestre',
          duracion: 90,
          precio: 165000,
          descripcion: 'Acceso por 3 meses'
        },
        {
          nombre: 'Semestre',
          duracion: 180,
          precio: 300000,
          descripcion: 'Acceso por 6 meses'
        },
        {
          nombre: 'Año',
          duracion: 365,
          precio: 580000,
          descripcion: 'Acceso por 1 año completo'
        }
      ],
      skipDuplicates: true,
    })

    console.log('✅ 8 planes creados exitosamente')
    console.log('🎉 Seed completado!')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })