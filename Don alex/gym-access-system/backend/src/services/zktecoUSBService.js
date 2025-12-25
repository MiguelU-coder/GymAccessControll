const { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

class ZKTecoUSBService {
    constructor(port = 'COM1', baudRate = 115200) {
        this.port = port;
        this.baudRate = baudRate;
        this.serialPort = null;
        this.isConnected = false;
    }

    // Conectar al dispositivo
    async connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔌 Conectando a ZK4500 en ${this.port}...`);
            
            this.serialPort = new SerialPort({
                path: this.port,
                baudRate: this.baudRate,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                autoOpen: false
            });

            this.serialPort.open((err) => {
                if (err) {
                    console.log('❌ Error abriendo puerto:', err.message);
                    reject(err);
                    return;
                }

                console.log('✅ Puerto serial abierto');
                this.isConnected = true;

                // Configurar parser
                this.parser = this.serialPort.pipe(new DelimiterParser({ delimiter: [0x0A] }));
                
                resolve(true);
            });

            this.serialPort.on('error', (err) => {
                console.log('❌ Error de puerto:', err.message);
                reject(err);
            });
        });
    }

    // Desconectar
    async disconnect() {
        return new Promise((resolve) => {
            if (this.serialPort && this.isConnected) {
                this.serialPort.close((err) => {
                    if (err) {
                        console.log('Error cerrando puerto:', err);
                    } else {
                        console.log('✅ Puerto cerrado');
                        this.isConnected = false;
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // Enviar comando y esperar respuesta
    async sendCommand(command, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('Dispositivo no conectado'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout esperando respuesta'));
            }, timeout);

            const dataHandler = (data) => {
                clearTimeout(timeoutId);
                this.parser.removeListener('data', dataHandler);
                console.log(`📥 Respuesta recibida: ${data.toString('hex')}`);
                resolve(data);
            };

            this.parser.once('data', dataHandler);

            console.log(`📤 Enviando comando: ${command.toString('hex')}`);
            this.serialPort.write(command, (err) => {
                if (err) {
                    clearTimeout(timeoutId);
                    this.parser.removeListener('data', dataHandler);
                    reject(err);
                }
            });
        });
    }

    // Comandos específicos para ZK4500
    async getDeviceInfo() {
        try {
            // Comando para obtener información del dispositivo
            const cmd = Buffer.from([0x50, 0x5A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const response = await this.sendCommand(cmd);
            
            // Procesar respuesta
            return this.parseDeviceInfo(response);
        } catch (error) {
            throw new Error(`Error obteniendo información: ${error.message}`);
        }
    }

    async getUsers() {
        try {
            // Comando para obtener lista de usuarios
            const cmd = Buffer.from([0x50, 0x5A, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const response = await this.sendCommand(cmd);
            
            return this.parseUsers(response);
        } catch (error) {
            throw new Error(`Error obteniendo usuarios: ${error.message}`);
        }
    }

    async getAttendances() {
        try {
            // Comando para obtener registros de asistencia
            const cmd = Buffer.from([0x50, 0x5A, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const response = await this.sendCommand(cmd);
            
            return this.parseAttendances(response);
        } catch (error) {
            throw new Error(`Error obteniendo asistencias: ${error.message}`);
        }
    }

    // Registrar nuevo usuario con huella
    async enrollUser(userId, userName) {
        try {
            console.log(`👆 Pídale al usuario que coloque el dedo en el lector...`);
            
            // Comando para iniciar registro de huella
            const startCmd = Buffer.from([0x50, 0x5A, 0x04, 0x00, userId, 0x00, 0x00, 0x00]);
            await this.sendCommand(startCmd);
            
            // Esperar y capturar huella
            const fingerprintCmd = Buffer.from([0x50, 0x5A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const response = await this.sendCommand(fingerprintCmd, 30000); // 30 segundos para capturar huella
            
            // Guardar usuario
            const saveCmd = Buffer.from([0x50, 0x5A, 0x06, 0x00, userId, ...Buffer.from(userName.substring(0, 8)), 0x00]);
            await this.sendCommand(saveCmd);
            
            return { success: true, userId, userName };
        } catch (error) {
            throw new Error(`Error registrando huella: ${error.message}`);
        }
    }

    // Funciones de parseo (simplificadas)
    parseDeviceInfo(data) {
        return {
            deviceName: 'ZK4500 USB',
            vendor: 'ZKTeco',
            firmware: '1.0.0',
            rawData: data.toString('hex')
        };
    }

    parseUsers(data) {
        // Implementar parseo real según protocolo ZK4500
        return [{ uid: 1, name: 'Admin' }];
    }

    parseAttendances(data) {
        // Implementar parseo real según protocolo ZK4500
        return [{ uid: 1, timestamp: Date.now() }];
    }
}

module.exports = ZKTecoUSBService;