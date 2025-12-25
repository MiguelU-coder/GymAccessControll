const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

const generarReporteAccesos = async (req, res) => {
  try {
    const { fecha, usuarioId } = req.query;

    // Filtrar accesos
    let where = {};
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.fechaHora = {
        gte: fechaInicio,
        lte: fechaFin
      };
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const accesos = await prisma.acceso.findMany({
      where,
      include: {
        usuario: {
          include: {
            membresia: {
              include: {
                plan: true
              }
            }
          }
        }
      },
      orderBy: {
        fechaHora: 'desc'
      }
    });

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers para descargar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-accesos-${fecha || 'todos'}.pdf`);

    doc.pipe(res);

    // Header del PDF
    doc.fontSize(20).text('Gym Access System', { align: 'center' });
    doc.fontSize(16).text('Reporte de Accesos', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Fecha del reporte: ${new Date().toLocaleDateString('es-CO')}`, { align: 'right' });
    if (fecha) {
      doc.text(`Fecha filtrada: ${new Date(fecha).toLocaleDateString('es-CO')}`, { align: 'right' });
    }
    doc.moveDown();

    // Estadísticas
    const entradas = accesos.filter(a => a.tipo === 'entrada').length;
    const salidas = accesos.filter(a => a.tipo === 'salida').length;

    doc.fontSize(12).text('Resumen:', { underline: true });
    doc.fontSize(10);
    doc.text(`Total de accesos: ${accesos.length}`);
    doc.text(`Entradas: ${entradas}`);
    doc.text(`Salidas: ${salidas}`);
    doc.moveDown();

    // Tabla de accesos
    doc.fontSize(12).text('Detalle de Accesos:', { underline: true });
    doc.moveDown(0.5);

    // Headers de tabla
    const tableTop = doc.y;
    const colWidths = {
      hora: 80,
      nombre: 150,
      cedula: 80,
      tipo: 60,
      plan: 100
    };

    doc.fontSize(9).font('Helvetica-Bold');
    let x = 50;
    doc.text('Hora', x, tableTop);
    x += colWidths.hora;
    doc.text('Nombre', x, tableTop);
    x += colWidths.nombre;
    doc.text('Cédula', x, tableTop);
    x += colWidths.cedula;
    doc.text('Tipo', x, tableTop);
    x += colWidths.tipo;
    doc.text('Plan', x, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Datos
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;

    accesos.forEach((acceso, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      x = 50;
      const hora = new Date(acceso.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const nombre = `${acceso.usuario.nombre} ${acceso.usuario.apellido}`;
      const cedula = acceso.usuario.cedula;
      const tipo = acceso.tipo;
      const plan = acceso.usuario.membresia?.plan?.nombre || 'Sin plan';

      doc.text(hora, x, y, { width: colWidths.hora });
      x += colWidths.hora;
      doc.text(nombre, x, y, { width: colWidths.nombre });
      x += colWidths.nombre;
      doc.text(cedula, x, y, { width: colWidths.cedula });
      x += colWidths.cedula;
      doc.text(tipo, x, y, { width: colWidths.tipo });
      x += colWidths.tipo;
      doc.text(plan, x, y, { width: colWidths.plan });

      y += 20;
    });

    // Footer
    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleString('es-CO')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

const generarReporteUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        membresia: {
          include: {
            plan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-usuarios.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Gym Access System', { align: 'center' });
    doc.fontSize(16).text('Reporte de Usuarios', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Fecha del reporte: ${new Date().toLocaleDateString('es-CO')}`, { align: 'right' });
    doc.moveDown();

    // Estadísticas
    const activos = usuarios.filter(u => {
      const membresia = u.membresia;
      if (!membresia) return false;
      return membresia.estado === 'activa' && new Date(membresia.fechaFin) > new Date();
    }).length;

    doc.fontSize(12).text('Resumen:', { underline: true });
    doc.fontSize(10);
    doc.text(`Total de usuarios: ${usuarios.length}`);
    doc.text(`Usuarios activos: ${activos}`);
    doc.text(`Usuarios sin plan: ${usuarios.filter(u => !u.membresia).length}`);
    doc.moveDown();

    // Tabla
    doc.fontSize(12).text('Detalle de Usuarios:', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = {
      nombre: 140,
      cedula: 80,
      telefono: 80,
      plan: 90,
      estado: 80
    };

    doc.fontSize(9).font('Helvetica-Bold');
    let x = 50;
    doc.text('Nombre', x, tableTop);
    x += colWidths.nombre;
    doc.text('Cédula', x, tableTop);
    x += colWidths.cedula;
    doc.text('Teléfono', x, tableTop);
    x += colWidths.telefono;
    doc.text('Plan', x, tableTop);
    x += colWidths.plan;
    doc.text('Estado', x, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;

    usuarios.forEach((usuario) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      x = 50;
      const nombre = `${usuario.nombre} ${usuario.apellido}`;
      const plan = usuario.membresia?.plan?.nombre || 'Sin plan';
      
      let estado = 'Sin plan';
      if (usuario.membresia) {
        if (usuario.membresia.estado !== 'activa') {
          estado = 'Inactiva';
        } else if (new Date(usuario.membresia.fechaFin) < new Date()) {
          estado = 'Vencida';
        } else {
          estado = 'Activa';
        }
      }

      doc.text(nombre, x, y, { width: colWidths.nombre });
      x += colWidths.nombre;
      doc.text(usuario.cedula, x, y, { width: colWidths.cedula });
      x += colWidths.cedula;
      doc.text(usuario.telefono, x, y, { width: colWidths.telefono });
      x += colWidths.telefono;
      doc.text(plan, x, y, { width: colWidths.plan });
      x += colWidths.plan;
      doc.text(estado, x, y, { width: colWidths.estado });

      y += 20;
    });

    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleString('es-CO')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generarReporteAccesos,
  generarReporteUsuarios
};
const generarReporteUsuarioIndividual = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
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
          take: 50
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${usuario.nombre}-${usuario.apellido}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Gym Access System', { align: 'center' });
    doc.fontSize(16).text('Reporte Individual de Usuario', { align: 'center' });
    doc.moveDown();

    // Información del usuario
    doc.fontSize(14).text('Información Personal', { underline: true });
    doc.fontSize(10);
    doc.text(`Nombre: ${usuario.nombre} ${usuario.apellido}`);
    doc.text(`Cédula: ${usuario.cedula}`);
    doc.text(`Email: ${usuario.email}`);
    doc.text(`Teléfono: ${usuario.telefono}`);
    doc.text(`Fecha de registro: ${new Date(usuario.createdAt).toLocaleDateString('es-CO')}`);
    doc.moveDown();

    // Membresía
    doc.fontSize(14).text('Membresía', { underline: true });
    doc.fontSize(10);
    if (usuario.membresia) {
      doc.text(`Plan: ${usuario.membresia.plan.nombre}`);
      doc.text(`Precio: $${usuario.membresia.plan.precio.toLocaleString()}`);
      doc.text(`Fecha de inicio: ${new Date(usuario.membresia.fechaInicio).toLocaleDateString('es-CO')}`);
      doc.text(`Fecha de vencimiento: ${new Date(usuario.membresia.fechaFin).toLocaleDateString('es-CO')}`);
      doc.text(`Estado: ${usuario.membresia.estado}`);
    } else {
      doc.text('Sin membresía activa');
    }
    doc.moveDown();

    // Estadísticas de accesos
    const totalAccesos = usuario.accesos.length;
    const accesosUltimos30Dias = usuario.accesos.filter(a => {
      const fecha = new Date(a.fechaHora);
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return fecha >= hace30Dias;
    }).length;

    doc.fontSize(14).text('Estadísticas de Acceso', { underline: true });
    doc.fontSize(10);
    doc.text(`Total de accesos (últimos 50): ${totalAccesos}`);
    doc.text(`Accesos en los últimos 30 días: ${accesosUltimos30Dias}`);
    doc.moveDown();

    // Últimos accesos
    doc.fontSize(14).text('Últimos 20 Accesos', { underline: true });
    doc.fontSize(8);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    let y = tableTop;

    // Headers
    doc.font('Helvetica-Bold');
    doc.text('Fecha', 50, y);
    doc.text('Hora', 150, y);
    doc.text('Tipo', 250, y);
    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

    // Datos
    doc.font('Helvetica');
    y += 20;

    usuario.accesos.slice(0, 20).forEach((acceso) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const fecha = new Date(acceso.fechaHora);
      doc.text(fecha.toLocaleDateString('es-CO'), 50, y);
      doc.text(fecha.toLocaleTimeString('es-CO'), 150, y);
      doc.text(acceso.tipo, 250, y);
      y += 20;
    });

    // Footer
    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleString('es-CO')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generarReporteAccesos,
  generarReporteUsuarios,
  generarReporteUsuarioIndividual
};