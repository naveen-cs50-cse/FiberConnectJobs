import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TechnicianDashboard from './pages/technician/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import FindJobs from './pages/dashboard/FindJobs';
import Assignments from './pages/dashboard/Assignments';
import Profile from './pages/dashboard/Profile';
import CreateJob from './pages/company/CreateJob';
import SeekerApplications from './pages/dashboard/SeekerApplications';
import HirerApplications from './pages/company/HirerApplications';
import Messages from './pages/dashboard/Messages';

const RoleRoute = ({ allowedRole, children }) => {
  const { user } = useAuth();
  
  // Legacy account fallback to prevent infinite loops
  const actualRole = user?.platformRole || user?.role;
  const effectiveRole = actualRole === 'USER' ? 'COMPANY_OWNER' : actualRole;

  if (effectiveRole !== allowedRole) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-red-100 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Your account type does not have permission to view this section. If this is a mistake, please create a new account.</p>
        </div>
      </div>
    );
  }
  return children;
};

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 transition-opacity duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary-600"></div>
      </div>
    );
  }

  const actualRole = user?.platformRole || user?.role;
  const effectiveRole = actualRole === 'USER' ? 'COMPANY_OWNER' : actualRole;
  const getDashboardRoute = () => effectiveRole === 'TECHNICIAN' ? "/dashboard/seeker" : "/dashboard/hirer";

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Home />} />
        <Route path="login" element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />} />
        <Route path="register" element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Register />} />
      </Route>
      
      {/* Main Dashboard Layout with distinct namespaces */}
      <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to={getDashboardRoute()} replace />} />
        
        {/* Seeker Routes */}
        <Route path="seeker" element={<RoleRoute allowedRole="TECHNICIAN"><TechnicianDashboard /></RoleRoute>} />
        <Route path="seeker/jobs" element={<RoleRoute allowedRole="TECHNICIAN"><FindJobs /></RoleRoute>} />
        <Route path="seeker/applications" element={<RoleRoute allowedRole="TECHNICIAN"><SeekerApplications /></RoleRoute>} />
        <Route path="seeker/assignments" element={<RoleRoute allowedRole="TECHNICIAN"><Assignments /></RoleRoute>} />
        
        {/* Hirer Routes */}
        <Route path="hirer" element={<RoleRoute allowedRole="COMPANY_OWNER"><CompanyDashboard /></RoleRoute>} />
        <Route path="hirer/jobs/new" element={<RoleRoute allowedRole="COMPANY_OWNER"><CreateJob /></RoleRoute>} />
        <Route path="hirer/jobs" element={<RoleRoute allowedRole="COMPANY_OWNER"><CompanyDashboard /></RoleRoute>} />
        <Route path="hirer/applications" element={<RoleRoute allowedRole="COMPANY_OWNER"><HirerApplications /></RoleRoute>} />
        
        {/* Shared Routes */}
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
