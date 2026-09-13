import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { t } from '../../utils/translations'
import {
  LayoutDashboard, MessageSquare, FileText, Stethoscope,
  Settings, LogOut, Menu, X, Shield, Bell, GitBranch, Globe
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
]

export default function AppLayout() {
  const { user, logout, language, setLanguage } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeLang = language || 'en'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/mediflow', icon: GitBranch, key: 'mediflow', badge: 'AGENT' },
    { to: '/chat', icon: MessageSquare, key: 'chat' },
    { to: '/reports', icon: FileText, key: 'reports' },
    { to: '/doctor-prep', icon: Stethoscope, key: 'doctorPrep' },
    { to: '/settings', icon: Settings, key: 'settings' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-slate-800 text-sm">MediBridge</span>
            <span className="block text-xs text-slate-400">AI Healthcare</span>
          </div>
        </div>
      </div>

      {/* Language Switcher in Sidebar */}
      <div className="px-4 py-3 bg-blue-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <Globe className="w-3.5 h-3.5" />
            <span>Language</span>
          </div>
          <select
            value={activeLang}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs bg-white border border-blue-200 text-slate-700 font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer shadow-sm"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, key, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
              ${isActive
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(key, activeLang)}</span>
            </div>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 uppercase">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
            {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all w-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          {t('signOut', activeLang)}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-xl lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-800 text-sm">MediBridge AI</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100 relative">
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
