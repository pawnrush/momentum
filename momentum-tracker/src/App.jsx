import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import DataEntry from './components/DataEntry'
import Reports from './components/Reports'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <Router>
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-entry" element={<DataEntry />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/students" element={<div className="p-6 text-white">Students page coming soon...</div>} />
            <Route path="/settings" element={<div className="p-6 text-white">Settings page coming soon...</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App