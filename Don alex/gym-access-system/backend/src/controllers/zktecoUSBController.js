const ZKTecoUSBService = require('../services/zktecoUSBService');

class ZKTecoUSBController {
    constructor() {
        this.zkService = new ZKTecoUSBService('COM1', 115200);
        this.isConnected = false;
    }

    async connectDevice(req, res) {
        try {
            await this.zkService.connect();
            this.isConnected = true;
            
            res.json({
                success: true,
                message: 'ZK4500 conectado exitosamente',
                port: 'COM1'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error conectando: ${error.message}`
            });
        }
    }

    async enrollUser(req, res) {
        try {
            const { userId, userName } = req.body;
            
            if (!this.isConnected) {
                await this.zkService.connect();
                this.isConnected = true;
            }

            const result = await this.zkService.enrollUser(userId, userName);
            
            res.json({
                success: true,
                message: 'Huella registrada exitosamente',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error registrando huella: ${error.message}`
            });
        }
    }

    async getUsers(req, res) {
        try {
            if (!this.isConnected) {
                await this.zkService.connect();
                this.isConnected = true;
            }

            const users = await this.zkService.getUsers();
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error obteniendo usuarios: ${error.message}`
            });
        }
    }
}

module.exports = new ZKTecoUSBController();