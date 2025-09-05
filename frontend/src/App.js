import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages  
import Dashboard from './pages/user/Dashboard';
import ActiveComplaints from './pages/user/ActiveComplaints';
import UserComplaintHistory from './pages/user/ComplaintHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintHistory from './pages/admin/ComplaintHistory';
import RegisterSubAdmin from './pages/admin/RegisterSubAdmin';

// Shared Pages
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import './App.css';

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/dashboard/active" element={
            <DashboardLayout>
              <ActiveComplaints />
            </DashboardLayout>
          } />
          <Route path="/dashboard/history" element={
            <DashboardLayout>
              <UserComplaintHistory />
            </DashboardLayout>
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          } />
          <Route path="/admin/history" element={
            <DashboardLayout>
              <AdminComplaintHistory />
            </DashboardLayout>
          } />
          <Route path="/admin/register-subadmin" element={
            <DashboardLayout>
              <RegisterSubAdmin />
            </DashboardLayout>
          } />
          
          {/* Shared Protected Routes */}
          <Route path="/profile" element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
);

export default App;