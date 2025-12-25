import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import NuevoUsuario from './pages/NuevoUsuario';
import DetalleUsuario from './pages/DetalleUsuario';
import EditarUsuario from './pages/EditarUsuario';
import Planes from './pages/Planes';
import EditarPlan from './pages/EditarPlan';
import Accesos from './pages/Accesos'; 
import Layout from './components/Layout';
import './styles/Global.css';    
import "./styles/Layout_old.css";
import './styles/Forms.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas con Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Rutas de Usuarios */}
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/nuevo" element={<NuevoUsuario />} />
          <Route path="usuarios/:id" element={<DetalleUsuario />} />
          <Route path="usuarios/editar/:id" element={<EditarUsuario />} />
          
          {/* Rutas de Planes */}
          <Route path="planes" element={<Planes />} />
          <Route path="planes/editar/:id" element={<EditarPlan />} />
          
          {/* Ruta de Accesos */}
          <Route path="accesos" element={<Accesos />} />
          
          {/* Rutas de desarrollo - puedes comentarlas si no las necesitas aún */}
          <Route path="usuarios/reportes" element={<div className="page-container">Reportes de Usuarios - En desarrollo</div>} />
          <Route path="planes/nuevo" element={<div className="page-container">Nuevo Plan - En desarrollo</div>} />
          <Route path="planes/reportes" element={<div className="page-container">Reportes de Planes - En desarrollo</div>} />
        </Route>

        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;