import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Globe, Bell, Shield, Save, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
]

export default function SettingsPage() {
  const { user, logout, language, setLanguage } = useAuth()
  const navigate = useNavigate()
  const [lang, setLang] = useState(language || 'en')
  const [name, setName] = useState(user?.displayName || '')
  const [notifications, setNotifications] = useState({ healthAlerts: true, weeklyReport: false, tips: true })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setLanguage(lang)
    await new Promise(r => setTimeout(r, 400))
    toast.success(`Settings saved! Preferred language set to ${LANGUAGES.find(l => l.code === lang)?.label || lang}`)
    setSaving(false)
  }

  const handleLogout = async () => {
    await logout(); navigate('/')
  }

  const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-card p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-500" />
        </div>
        <h2 className="font-heading font-semibold text-slate-700">{title}</h2>
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 mb-6">Settings</h1>

        <Section icon={User} title="Profile">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-700">{user?.displayName || 'User'}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Display Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
        </Section>

        <Section icon={Globe} title="Language Preference">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${lang === l.code ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div className="space-y-3">
            {[
              { key: 'healthAlerts', label: 'Health Alerts', desc: 'Urgent risk notifications' },
              { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Weekly health activity digest' },
              { key: 'tips', label: 'Health Tips', desc: 'Daily wellness suggestions' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.label}</p>
                  <p className="text-xs text-slate-400">{n.desc}</p>
                </div>
                <button onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))}
                  className={`w-11 h-6 rounded-full transition-all duration-200 ${notifications[n.key] ? 'bg-blue-500' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 mx-1 ${notifications[n.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Shield} title="Privacy & Security">
          <div className="space-y-2">
            {[
              'Your health data is encrypted at rest',
              'AI conversations are not stored permanently',
              'No data is shared with third parties',
            ].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                {p}
              </div>
            ))}
          </div>
        </Section>

        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-500 border border-red-200 hover:bg-red-50 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
