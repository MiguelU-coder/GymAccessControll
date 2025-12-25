import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const [sidebarClosed, setSidebarClosed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarClosed(!sidebarClosed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setMenuAbierto(null);
  };

  const toggleSubmenu = (menu) => {
    setMenuAbierto(menuAbierto === menu ? null : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { 
      type: 'simple',
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: '📊' 
    },
    { 
      type: 'submenu',
      key: 'usuarios',
      label: 'Usuarios', 
      icon: '👥',
      items: [
        { path: '/usuarios', label: 'Gestión de Usuarios' },
        { path: '/usuarios/nuevo', label: 'Nuevo Usuario' },
        { path: '/usuarios/reportes', label: 'Reportes' }
      ]
    },
    { 
      type: 'submenu',
      key: 'planes',
      label: 'Planes', 
      icon: '📋',
      items: [
        { path: '/planes', label: 'Gestión de Planes' },
        { path: '/planes/nuevo', label: 'Nuevo Plan' },
        { path: '/planes/reportes', label: 'Reportes' }
      ]
    },
    { 
      type: 'simple',
      path: '/accesos', 
      label: 'Accesos', 
      icon: '🔐' 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some(item => isActive(item.path));
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          ☰
        </button>
        <div className="logo">
          <div className="logo-icon">🏋️</div>
          <span className="logo-text">Gym System</span>
        </div>
      </div>

      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mejorado con Submenús */}
      <div className={`sidebar ${sidebarClosed ? 'sidebar-closed' : ''} ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🏋️</div>
            <span className="logo-text">Gym System</span>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarClosed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            if (item.type === 'simple') {
              return (
                <button
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            }

            if (item.type === 'submenu') {
              const isActiveSubmenu = isSubmenuActive(item.items);
              const isOpen = menuAbierto === item.key;

              return (
                <div key={item.key} className="nav-submenu">
                  <button
                    className={`nav-item nav-submenu-toggle ${isActiveSubmenu ? 'nav-item-active' : ''}`}
                    onClick={() => toggleSubmenu(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <span className={`submenu-arrow ${isOpen ? 'submenu-arrow-open' : ''}`}>
                      {isOpen ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  <div className={`submenu-items ${isOpen ? 'submenu-items-open' : ''}`}>
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.path}
                        className={`submenu-item ${isActive(subItem.path) ? 'submenu-item-active' : ''}`}
                        onClick={() => handleNavigation(subItem.path)}
                      >
                        <span className="submenu-dot"></span>
                        <span className="submenu-label">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;