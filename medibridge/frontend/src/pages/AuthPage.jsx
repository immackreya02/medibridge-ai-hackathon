import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Shield, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, register, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else if (mode === 'register') await register(form.email, form.password, form.name)
      else { await resetPassword(form.email); toast.success('Reset email sent!'); setMode('login'); setLoading(false); return }
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try { await loginWithGoogle(); navigate('/dashboard') }
    catch (err) { toast.error(err.message || 'Google sign-in failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-xl">MediBridge AI</span>
        </div>
        <div>
          <h2 className="font-heading font-bold text-4xl text-white leading-tight mb-4">
            Your health journey starts with clarity.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Understand symptoms, simplify medical reports, and prepare for doctor visits — in your language.
          </p>
          <div className="mt-8 space-y-3">
            {['Multilingual AI symptom guidance','Medical report simplification','Emergency risk detection','Doctor visit preparation'].map(f => (
              <div key={f} className="flex items-center gap-3 text-blue-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-xs">© 2026 MediBridge AI · FlowZint Hackathon</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-800">MediBridge AI</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <h1 className="font-heading font-bold text-2xl text-slate-800 mb-1">
                {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                {mode === 'login' ? 'Sign in to your MediBridge account' : mode === 'register' ? 'Start your healthcare journey' : 'Enter your email to receive a reset link'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input required className="input-field pl-10" placeholder="Full name" value={form.name} onChange={set('name')} />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input required type="email" className="input-field pl-10" placeholder="Email address" value={form.email} onChange={set('email')} />
                </div>
                {mode !== 'reset' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input required type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Password" value={form.password} onChange={set('password')} minLength={6} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode('reset')} className="text-xs text-blue-500 hover:underline">Forgot password?</button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>
              </form>

              {mode !== 'reset' && (
                <>
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="px-3 bg-surface text-xs text-slate-400">or continue with</span></div>
                  </div>
                  <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full flex items-center justify-center gap-2">
                    <Chrome className="w-4 h-4" /> Continue with Google
                  </button>
                </>
              )}

              <p className="text-center text-sm text-slate-500 mt-6">
                {mode === 'login' ? "Don't have an account? " : mode === 'register' ? "Already have an account? " : "Remember your password? "}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-blue-500 font-medium hover:underline">
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
