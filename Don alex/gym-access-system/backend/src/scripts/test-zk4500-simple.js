const { SerialPort } = require('serialport');

console.log('🧪 PRUEBA SIMPLE ZK4500 - Comandos básicos\n');

async function testSimpleCommands() {
    const port = new SerialPort({ 
        path: 'COM1', 
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    });

    return new Promise((resolve) => {
        console.log('1. 🔌 Abriendo puerto COM1...');

        port.on('open', () => {
            console.log('   ✅ Puerto abierto exitosamente');
            
            console.log('2. 📤 Enviando comandos de prueba...');
            
            // Comandos más comunes para dispositivos biométricos
            const commands = [
                'GET INFO\r\n',
                'VERSION\r\n', 
                'STATUS\r\n',
                'TEST\r\n',
                Buffer.from([0x55, 0xAA, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), // Comando común
                Buffer.from([0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), // Otro formato
            ];

            let commandIndex = 0;
            let responses = [];

            const sendNextCommand = () => {
                if (commandIndex >= commands.length) {
                    console.log('3. 🔌 Cerrando puerto...');
                    port.close();
                    console.log('   ✅ Puerto cerrado');
                    
                    if (responses.length > 0) {
                        console.log('\n🎉 ¡El dispositivo respondió!');
                        console.log('📥 Respuestas recibidas:', responses);
                    } else {
                        console.log('\n❌ El dispositivo no respondió a ningún comando');
                        console.log('\n💡 El ZK4500 puede estar en modo sleep o necesitar wake-up');
                    }
                    
                    resolve(responses);
                    return;
                }

                const command = commands[commandIndex];
                const isBuffer = Buffer.isBuffer(command);
                
                console.log(`   📤 Enviando comando ${commandIndex + 1}: ${isBuffer ? command.toString('hex') : command.trim()}`);
                
                port.write(command);
                commandIndex++;

                // Esperar un poco antes del siguiente comando
                setTimeout(sendNextCommand, 1000);
            };

            // Escuchar respuestas
            port.on('data', (data) => {
                console.log(`   📥 RESPUESTA: ${data.toString('hex')} (${data.length} bytes)`);
                responses.push({
                    command: commandIndex,
                    data: data.toString('hex'),
                    length: data.length
                });
            });

            // Empezar a enviar comandos
            sendNextCommand();
        });

        port.on('error', (err) => {
            console.log('❌ Error:', err.message);
            resolve([]);
        });

        // Timeout general
        setTimeout(() => {
            console.log('⏰ Timeout - Cerrando prueba');
            port.close();
            resolve([]);
        }, 15000);
    });
}

async function main() {
    const responses = await testSimpleCommands();
    
    console.log('\n' + '='.repeat(50));
    if (responses.length > 0) {
        console.log('🎉 ¡ZK4500 DETECTADO Y RESPONDIENDO!');
        console.log('💡 Ahora sabemos que comandos funcionan');
    } else {
        console.log('❌ El ZK4500 no respondió');
        console.log('\n🔧 ULTIMAS OPCIONES:');
        console.log('   1. 🔌 Conecta el ZK4500 por ETHERNET (recomendado)');
        console.log('   2. 📞 Contacta al proveedor por el software de configuración');
        console.log('   3. 🔄 Prueba con un convertidor USB-Serial externo');
    }
    console.log('='.repeat(50));
}

main();