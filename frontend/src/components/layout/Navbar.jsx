import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, User, Menu, X } from 'lucide-react'
import NotificationSidebar from './NotificationSidebar'
import { notifications } from '../../mock/notifications'

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="bg-gray-50 relative">
      <div className="border-b-2 border-gray-200 px-4 md:px-10 py-4 flex items-center justify-between">

        <Link to="/" className="text-gray-900 text-xl font-semibold">
          OpenNotes
        </Link>

        <ul className="hidden md:flex gap-10">
          <li>
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
          </li>
          <li>
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
          </li>
        </ul>

    
        <div className="flex items-center gap-6 text-gray-700">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "text-indigo-600" : "hover:text-indigo-600"
            }
          >
            <User />
          </NavLink>

          <button onClick={() => setIsSidebarOpen(true)}>
            <Bell className="hover:text-indigo-600" />
          </button>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-3">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `font-medium ${
                isActive ? "text-indigo-600" : "text-gray-700"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `font-medium ${
                isActive ? "text-indigo-600" : "text-gray-700"
              }`
            }
          >
            Upload
          </NavLink>
        </div>
      )}

      {isSidebarOpen && (
        <NotificationSidebar
          closePanelHandler={() => setIsSidebarOpen(false)}
          notifications={notifications}
        />
      )}
    </div>
  )
}

export default Navbar
