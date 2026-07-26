import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, User, Menu, X, LogOut } from "lucide-react";
import NotificationSidebar from "./NotificationSidebar";
import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../api/apis";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await getNotifications();
        setUnreadCount(data.unreadCount || 0);
      } catch {
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <div className="bg-gray-50 relative">
      <div className="border-b border-gray-200 px-4 md:px-10 py-4 flex items-center">

        <Link to="/" className="text-gray-900 text-xl font-semibold">
          OpenNotes
        </Link>

        <ul className="hidden md:flex flex-1 justify-center gap-10">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
              }`
            }
          >
            Upload
          </NavLink>

          <NavLink
            to="/purchases"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
              }`
            }
          >
            My Purchases
          </NavLink>
        </ul>

        <div className="hidden md:flex items-center gap-6 text-gray-700">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">
                <User className="hover:text-indigo-600 transition" />
              </NavLink>

              <button onClick={handleOpenSidebar} className="relative">
                <Bell className="hover:text-indigo-600 transition" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <button onClick={handleLogout} title="Logout">
                <LogOut className="hover:text-red-500 transition" size={20} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/sign-in" className="font-medium hover:text-indigo-600 transition">
                Login
              </NavLink>
              <NavLink to="/sign-up" className="font-medium hover:text-indigo-600 transition">
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4 ml-auto text-gray-700">
          {isAuthenticated && (
            <button onClick={handleOpenSidebar} className="relative">
              <Bell className="hover:text-indigo-600 transition" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <button onClick={() => setIsMobileMenuOpen(prev => !prev)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex flex-col gap-3">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-medium text-gray-700 hover:text-indigo-600"
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-medium text-gray-700 hover:text-indigo-600"
          >
            Upload
          </NavLink>

          <NavLink
            to="/purchases"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-medium text-gray-700 hover:text-indigo-600"
          >
            My Purchases
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-indigo-600"
              >
                Dashboard
              </NavLink>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-red-500 font-medium hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-indigo-600"
              >
                Login
              </NavLink>

              <NavLink
                to="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-indigo-600"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      )}

      {isAuthenticated && isSidebarOpen && (
        <NotificationSidebar
          closePanelHandler={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;