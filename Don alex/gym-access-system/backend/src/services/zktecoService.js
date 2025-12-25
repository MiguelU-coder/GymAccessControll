const ZKLib = require('node-zklib');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ZKTecoService {
  constructor() {
    this.deviceConfig = {
      ip: process.env.ZKTECO_IP || '192.168.1.201',
      port: parseInt(process.env.ZKTECO_PORT) || 4370,
      timeout: 10000,
      inport: 5200
    };
    this.zkInstance = null;
  }

  async connect() {
    try {
      console.log(`🔌 Conectando a ZKTeco en: ${this.deviceConfig.ip}:${this.deviceConfig.port}`);
      
      this.zkInstance = new ZKLib(
        this.deviceConfig.ip,
        this.deviceConfig.port,
        this.deviceConfig.timeout,
        this.deviceConfig.inport
      );
      
      await this.zkInstance.createSocket();
      console.log('✅ Conectado al dispositivo ZKTeco');
      return true;
    } catch (error) {
      console.error('❌ Error conectando al dispositivo:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.zkInstance) {
      await this.zkInstance.disconnect();
      this.zkInstance = null;
      console.log('🔌 Desconectado del dispositivo ZKTeco');
    }
  }

  // Registrar usuario con huella
  async registerUser(usuarioId, nombre) {
    try {
      await this.connect();
      
      // Convertir usuarioId a número (requerido por el dispositivo)
      const deviceUserId = parseInt(usuarioId);
      
      // Registrar usuario en el dispositivo
      await this.zkInstance.setUser(
        deviceUserId,
        nombre,
        '', // password vacío
        0   // role (0 = usuario normal)
      );

      console.log(`✅ Usuario ${nombre} registrado en dispositivo con ID: ${deviceUserId}`);
      
      await this.disconnect();
      
      // Actualizar en base de datos
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { 
          huellaRegistrada: true,
          dispositivoId: deviceUserId
        }
      });

      return { 
        success: true, 
        deviceUserId,
        message: 'Usuario registrado. Ahora coloque el dedo en el lector para capturar la huella.'
      };
    } catch (error) {
      console.error('Error registrando usuario:', error);
      throw error;
    }
  }

  // Obtener asistencias del dispositivo
  async getAttendances() {
    try {
      await this.connect();
      const attendances = await this.zkInstance.getAttendances();
      await this.disconnect();
      
      console.log(`📊 ${attendances.length} asistencias obtenidas del dispositivo`);
      return attendances;
    } catch (error) {
      console.error('Error obteniendo asistencias:', error);
      throw error;
    }
  }

  // Sincronizar asistencias con la base de datos
  async syncAttendances() {
    try {
      const attendances = await this.getAttendances();
      let syncedCount = 0;
      
      for (const attendance of attendances) {
        // Buscar usuario por dispositivoId
        const usuario = await prisma.usuario.findFirst({
          where: { dispositivoId: attendance.uid }
        });

        if (usuario) {
          // Verificar si el acceso ya existe
          const existingAccess = await prisma.acceso.findFirst({
            where: {
              usuarioId: usuario.id,
              fechaHora: new Date(attendance.timestamp * 1000)
            }
          });

          if (!existingAccess) {
            // Registrar acceso en la base de datos
            await prisma.acceso.create({
              data: {
                usuarioId: usuario.id,
                fechaHora: new Date(attendance.timestamp * 1000),
                tipo: 'ENTRADA',
                dispositivo: 'ZKTeco_4500'
              }
            });
            syncedCount++;
          }
        }
      }

      console.log(`🔄 Sincronizadas ${syncedCount} nuevas asistencias`);
      return { synced: syncedCount, total: attendances.length };
    } catch (error) {
      console.error('Error sincronizando asistencias:', error);
      throw error;
    }
  }

  // Obtener usuarios del dispositivo
  async getDeviceUsers() {
    try {
      await this.connect();
      const users = await this.zkInstance.getUsers();
      await this.disconnect();
      
      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios del dispositivo:', error);
      throw error;
    }
  }

  // Eliminar usuario del dispositivo
  async deleteUser(deviceUserId) {
    try {
      await this.connect();
      await this.zkInstance.deleteUser(deviceUserId);
      await this.disconnect();
      
      console.log(`🗑️ Usuario ${deviceUserId} eliminado del dispositivo`);
      return { success: true };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Verificar estado del dispositivo
  async getDeviceStatus() {
    try {
      await this.connect();
      const info = await this.zkInstance.getInfo();
      await this.disconnect();
      
      return {
        status: 'online',
        deviceName: info.deviceName,
        serialNumber: info.serialNumber,
        macAddress: info.macAddress
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message
      };
    }
  }
}

module.exports = new ZKTecoService();