import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Prediction from './pages/Prediction';
import PatientHistory from './pages/PatientHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Report from './pages/Report';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Doctors from './pages/Doctors';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import ServerError from './pages/ServerError';

// Services
import authService from './services/authService';

// Create Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
          console.warn("Token validation failed or server starting:", error);
          if (error.response?.status === 401) {
            authService.logout();
            setUser(null);
          } else {
            // Retain cached user session while server is connecting
            const cached = authService.getUser();
            if (cached) setUser(cached);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isClinician: user?.role === 'clinician' || user?.role === 'admin',
    isPatient: user?.role === 'patient'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Route Guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton animate-pulse-ai" style={{ width: '64px', height: '64px', borderRadius: '50%' }}></div>
        <p className="text-muted" style={{ fontStyle: 'italic' }}>Securing clinical session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Wrapper to dynamically render views based on user roles
const DashboardWrapper = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'patient') return <PatientDashboard />;
  return <Dashboard />;
};

// App Content Layout Wrapper
const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Pages that do not display Sidebar / Navbar
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {user && <Sidebar />}
      <div className="main-content">
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <DashboardWrapper />
            </PrivateRoute>
          } />
          <Route path="/patients" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <PatientHistory />
            </PrivateRoute>
          } />
          <Route path="/doctors" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Doctors />
            </PrivateRoute>
          } />
          <Route path="/upload" element={
            <PrivateRoute roles={['clinician', 'admin']}>
              <Upload />
            </PrivateRoute>
          } />
          <Route path="/predictions" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Prediction />
            </PrivateRoute>
          } />
          <Route path="/predictions/:id" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Prediction />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Settings />
            </PrivateRoute>
          } />
          <Route path="/reports/:id" element={
            <PrivateRoute roles={['clinician', 'admin', 'patient']}>
              <Report />
            </PrivateRoute>
          } />
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {user && <Footer />}
        {user && <AIAssistant />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
