import { Link, useLocation } from 'react-router-dom'
import { BarChart3, PlusCircle, Settings, Users, FileText } from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/data-entry', icon: PlusCircle, label: 'Data Entry' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold">Beacon</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar

