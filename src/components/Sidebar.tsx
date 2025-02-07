import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, List } from 'lucide-react'

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-white border-r">
      <nav className="p-4 space-y-2">
        <Link to="/">
          <div className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer ${location.pathname === '/' ? 'bg-gray-100' : ''}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </div>
        </Link>
        <Link to="/estimates">
          <div className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer ${location.pathname === '/estimates' ? 'bg-gray-100' : ''}`}>
            <FileText className="h-5 w-5" />
            <span>Estimates</span>
          </div>
        </Link>
        <Link to="/pricing-list">
          <div className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer ${location.pathname === '/pricing-list' ? 'bg-gray-100' : ''}`}>
            <List className="h-5 w-5" />
            <span>Pricing List</span>
          </div>
        </Link>
        <Link to="/settings">
          <div className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer ${location.pathname === '/settings' ? 'bg-gray-100' : ''}`}>
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </div>
        </Link>
      </nav>
    </div>
  )
} 