import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Clock, 
  LogOut,
  Dumbbell 
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/usuarios', icon: Users, label: 'Usuarios' },
    { path: '/planes', icon: CreditCard, label: 'Planes' },
    { path: '/accesos', icon: Clock, label: 'Accesos' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Dumbbell size={32} />
        </div>
        <h2 className="sidebar-title">Gym Access</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {admin.nombre?.charAt(0) || 'A'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{admin.nombre}</p>
            <p className="sidebar-user-role">{admin.rol}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;