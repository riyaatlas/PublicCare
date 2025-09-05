import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userMenuItems = [
    { title: "Raise Complaint", path: "/dashboard", icon: "📝" },
    { title: "Active Complaints", path: "/dashboard/active", icon: "📋" },
    { title: "Complaint History", path: "/dashboard/history", icon: "📚" },
  ];

  const adminMenuItems = [
    { title: "Active Complaints", path: "/admin/dashboard", icon: "📋" },
    { title: "Complaint History", path: "/admin/history", icon: "📚" },
    ...(user?.role === 'superadmin' ? [
      { title: "Register SubAdmin", path: "/admin/register-subadmin", icon: "👤" }
    ] : [])
  ];

  const menuItems = user?.role === 'user' ? userMenuItems : adminMenuItems;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="mobile-logo">
          <span className="logo-icon">PC</span>
          <span className="logo-text">PublicCare</span>
        </div>
        <div className="mobile-user">
          <span className="user-role">{user?.role}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">PC</div>
            <div className="logo-content">
              <h1 className="logo-title">PublicCare</h1>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Menu</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="/profile" className="nav-link">
                  <span className="nav-icon">👤</span>
                  <span>My Profile</span>
                </a>
              </li>
              {menuItems.map((item) => (
                <li key={item.title} className="nav-item">
                  <a href={item.path} className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;