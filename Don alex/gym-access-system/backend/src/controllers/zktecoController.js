const zktecoService = require('../services/zktecoService');

const zktecoController = {
  // Registrar huella para usuario
  registrarHuella: async (req, res) => {
    try {
      const { usuarioId, nombre } = req.body;
      
      if (!usuarioId || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId y nombre son requeridos'
        });
      }
      
      const result = await zktecoService.registerUser(usuarioId, nombre);
      
      res.json({
        success: true,
        message: 'Usuario registrado en el dispositivo. Coloque el dedo en el lector.',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registrando huella: ' + error.message
      });
    }
  },

  // Sincronizar asistencias
  sincronizarAsistencias: async (req, res) => {
    try {
      const result = await zktecoService.syncAttendances();
      
      res.json({
        success: true,
        message: `Asistencias sincronizadas: ${result.synced} nuevos registros de ${result.total} totales`,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sincronizando asistencias: ' + error.message
      });
    }
  },

  // Obtener estado del dispositivo
  obtenerEstado: async (req, res) => {
    try {
      const status = await zktecoService.getDeviceStatus();
      
      res.json({
        success: status.status === 'online',
        message: status.status === 'online' ? 'Dispositivo conectado' : 'Dispositivo desconectado',
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estado: ' + error.message
      });
    }
  },

  // Obtener usuarios del dispositivo
  obtenerUsuariosDispositivo: async (req, res) => {
    try {
      const users = await zktecoService.getDeviceUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios: ' + error.message
      });
    }
  },

  // Eliminar usuario del dispositivo
  eliminarUsuario: async (req, res) => {
    try {
      const { deviceUserId } = req.params;
      
      const result = await zktecoService.deleteUser(parseInt(deviceUserId));
      
      res.json({
        success: true,
        message: 'Usuario eliminado del dispositivo',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error eliminando usuario: ' + error.message
      });
    }
  }
};

module.exports = zktecoController;