import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, FileText, History, Plus, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./AppSidebar.css";

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  // Check if current link is active
  const getNavCls = (path) =>
    currentPath === path
      ? "sidebar-link active"
      : "sidebar-link";

  // Generate menu items based on user role
  const getUserMenuItems = () => {
    if (!user) return [];
    if (user.role === "user") {
      return [
        { title: "Raise Complaint", url: "/dashboard", icon: Plus },
        { title: "Active Complaints", url: "/dashboard/active", icon: FileText },
        { title: "Complaint History", url: "/dashboard/history", icon: History },
      ];
    } else {
      const items = [
        { title: "Active Complaints", url: "/admin/dashboard", icon: FileText },
        { title: "Complaint History", url: "/admin/history", icon: History },
      ];
      if (user.role === "superadmin") {
        items.push({ title: "Register SubAdmin", url: "/admin/register-subadmin", icon: Plus });
      }
      return items;
    }
  };

  const menuItems = getUserMenuItems();

  return (
    <div className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>PC</span>
        </div>
        <div>
          <h1 className="sidebar-title">PublicCare</h1>
          <p className="sidebar-role">{user?.role || "Guest"}</p>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Menu</div>
          <div className="sidebar-group-content">
            <NavLink to="/profile" className={getNavCls("/profile")}>
              <User className="icon" />
              <span>My Profile</span>
            </NavLink>

            {menuItems.map((item) => (
              <NavLink key={item.title} to={item.url} className={getNavCls(item.url)}>
                <item.icon className="icon" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={logout}>
          <LogOut className="icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
