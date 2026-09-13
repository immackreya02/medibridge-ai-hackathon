import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { t } from '../utils/translations'
import Disclaimer from '../components/ui/Disclaimer'
import {
  MessageSquare, FileText, AlertTriangle, BookOpen,
  ArrowRight, Clock, TrendingUp, Activity
} from 'lucide-react'

const mockStats = [
  { label: 'Total Chats', value: '12', icon: MessageSquare, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { label: 'Reports Analyzed', value: '5', icon: FileText, color: 'from-teal-400 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-600' },
  { label: 'Risk Alerts', value: '2', icon: AlertTriangle, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  { label: 'Saved Summaries', value: '3', icon: BookOpen, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
]

const recentChats = [
  { id: 1, preview: 'Fever and headache for 3 days', risk: 'moderate', time: '2h ago' },
  { id: 2, preview: 'Chest pain and shortness of breath', risk: 'high', time: '1d ago' },
  { id: 3, preview: 'Mild stomach ache after eating', risk: 'low', time: '2d ago' },
]

const riskColors = { low: 'badge-low', moderate: 'badge-moderate', high: 'badge-high', emergency: 'badge-emergency' }

const quickActions = [
  { label: 'Start AI Chat', icon: MessageSquare, path: '/chat', desc: 'Describe your symptoms', color: 'from-blue-500 to-blue-600' },
  { label: 'Analyze Report', icon: FileText, path: '/reports', desc: 'Upload a medical report', color: 'from-teal-500 to-teal-600' },
  { label: 'Doctor Prep', icon: Activity, path: '/doctor-prep', desc: 'Prepare for consultation', color: 'from-purple-500 to-purple-600' },
]

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } })

export default function DashboardPage() {
  const { user, language } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.displayName?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp()} className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{t('healthOverview', language)}</p>
      </motion.div>

      <Disclaimer className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mockStats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i * 0.08)} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <p className="font-heading font-bold text-2xl text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* MediFlow AI Feature Banner */}
      <motion.div
        {...fadeUp(0.15)}
        onClick={() => navigate('/mediflow')}
        className="mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                NEW FEATURE — HACKATHON DEMO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">MediFlow AI Orchestrator</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Goal-driven agentic hospital bed search, capacity evaluation, verification, and dynamic failure re-routing with human approval.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-md flex-shrink-0 group-hover:translate-x-1">
            <span>Launch MediFlow</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-1">
          <h2 className="font-heading font-semibold text-slate-700 mb-3">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="w-full glass-card p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{a.label}</p>
                  <p className="text-xs text-slate-500">{a.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Chats */}
        <motion.div {...fadeUp(0.3)} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-slate-700">Recent Chats</h2>
            <button onClick={() => navigate('/chat')} className="text-xs text-blue-500 hover:underline font-medium">View all</button>
          </div>
          <div className="glass-card overflow-hidden">
            {recentChats.map((c, i) => (
              <div
                key={c.id}
                onClick={() => navigate('/chat')}
                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50/50 transition-colors ${i < recentChats.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{c.preview}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={riskColors[c.risk] + ' text-xs'}>{c.risk}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{c.time}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
