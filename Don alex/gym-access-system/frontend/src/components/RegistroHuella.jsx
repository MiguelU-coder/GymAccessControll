import React, { useState } from 'react';
import { registrarHuella } from '../services/api';

const RegistroHuella = ({ usuario, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegistrarHuella = async () => {
    if (!usuario?.id) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await registrarHuella(usuario.id);
      
      if (result.success) {
        setMessage('✅ Huella registrada exitosamente');
        onSuccess?.();
      } else {
        setMessage('❌ Error: ' + result.message);
      }
    } catch (error) {
      setMessage('❌ Error registrando huella: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Registro de Huella Digital</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
            <p className="text-sm text-gray-600">
              Estado: {usuario.huellaRegistrada ? '✅ Registrada' : '❌ No registrada'}
            </p>
          </div>
          
          {!usuario.huellaRegistrada && (
            <button
              onClick={handleRegistrarHuella}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Huella'}
            </button>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {!usuario.huellaRegistrada && (
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Instrucciones:</strong> 
              <br />1. Asegúrate que el dispositivo ZKTeco esté encendido
              <br />2. El usuario debe colocar su dedo en el lector
              <br />3. Espera a que se complete el registro
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroHuella;