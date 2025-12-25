import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

function NotificationCenter() {
  const [mostrar, setMostrar] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    // Cargar notificaciones del localStorage
    const notifs = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    setNotificaciones(notifs);

    // Simular verificación periódica (cada 30 segundos)
    const interval = setInterval(() => {
      verificarNotificaciones();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const verificarNotificaciones = async () => {
    // Aquí puedes hacer una petición al backend para obtener notificaciones nuevas
    // Por ahora, simulamos algunas notificaciones
  };

  const agregarNotificacion = (notif) => {
    const nuevasNotifs = [notif, ...notificaciones].slice(0, 10); // Máximo 10
    setNotificaciones(nuevasNotifs);
    localStorage.setItem('notificaciones', JSON.stringify(nuevasNotifs));
  };

  const eliminarNotificacion = (id) => {
    const nuevasNotifs = notificaciones.filter(n => n.id !== id);
    setNotificaciones(nuevasNotifs);
    localStorage.setItem('notificaciones', JSON.stringify(nuevasNotifs));
  };

  const limpiarTodas = () => {
    setNotificaciones([]);
    localStorage.removeItem('notificaciones');
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const getIcono = (tipo) => {
    switch(tipo) {
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="notification-center">
      <button 
        onClick={() => setMostrar(!mostrar)}
        className="header-btn notification-btn"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="notification-badge">{noLeidas}</span>
        )}
      </button>

      {mostrar && (
        <>
          <div 
            className="notification-overlay"
            onClick={() => setMostrar(false)}
          />
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              {notificaciones.length > 0 && (
                <button onClick={limpiarTodas} className="btn-text">
                  Limpiar todas
                </button>
              )}
            </div>

            <div className="notification-list">
              {notificaciones.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={48} />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.leida ? 'no-leida' : ''}`}
                  >
                    <div className="notification-icon">
                      {getIcono(notif.tipo)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notif.titulo}</p>
                      <p className="notification-message">{notif.mensaje}</p>
                      <p className="notification-time">
                        {new Date(notif.fecha).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarNotificacion(notif.id)}
                      className="notification-close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Función helper para agregar notificaciones desde cualquier parte de la app
export const agregarNotificacion = (titulo, mensaje, tipo = 'info') => {
  const notif = {
    id: Date.now().toString(),
    titulo,
    mensaje,
    tipo,
    fecha: new Date().toISOString(),
    leida: false
  };

  const notifs = JSON.parse(localStorage.getItem('notificaciones') || '[]');
  const nuevasNotifs = [notif, ...notifs].slice(0, 10);
  localStorage.setItem('notificaciones', JSON.stringify(nuevasNotifs));

  // Disparar evento personalizado para actualizar el componente
  window.dispatchEvent(new Event('nueva-notificacion'));
};

export default NotificationCenter;