
import { Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';

const Admin = () => {
  // Redirect old admin route to new dashboard
  return <Navigate to="/admin" replace />;
};

export default Admin;
