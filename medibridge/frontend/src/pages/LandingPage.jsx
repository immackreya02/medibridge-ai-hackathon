import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Globe, Brain, FileSearch, Stethoscope, Zap,
  ChevronRight, Star, ArrowRight, Heart, Activity, CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Symptom Understanding',
    desc: 'Describe your symptoms in plain language. Our AI extracts key information and provides clear, guided next steps.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'Communicate in English, Hindi, Tamil, Marathi, or Telugu. Language should never be a barrier to healthcare.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: Zap,
    title: 'Emergency Detection',
    desc: 'Instantly identifies high-urgency situations and clearly guides you to take the right action immediately.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: FileSearch,
    title: 'Report Simplifier',
    desc: 'Upload your medical reports. AI translates complex medical jargon into easy-to-understand summaries.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Preparation',
    desc: 'Walk into consultations prepared with AI-generated symptom timelines and smart questions for your doctor.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your health data stays protected with Firebase authentication and encrypted storage at every step.',
    color: 'from-indigo-500 to-blue-600',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Patient, Mumbai',
    text: 'MediBridge helped me understand my mother\'s blood test report in Hindi. The simplification was incredibly accurate and calming.',
    avatar: 'PS',
  },
  {
    name: 'Dr. Kavitha Rao',
    role: 'General Physician, Bangalore',
    text: 'Patients who use MediBridge come to consultations far better prepared. The doctor prep summaries are genuinely useful.',
    avatar: 'KR',
  },
  {
    name: 'Arjun Mehta',
    role: 'Software Engineer, Hyderabad',
    text: 'Had chest tightness at 2 AM and didn\'t know if it was serious. MediBridge flagged it immediately and told me to seek care.',
    avatar: 'AM',
  },
]

const stats = [
  { value: '5 Languages', label: 'Supported' },
  { value: '4 Risk Levels', label: 'Detected' },
  { value: 'Zero Compromise', label: 'on Privacy' },
  { value: '24 / 7', label: 'AI Availability' },
]

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface font-body overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-800">MediBridge AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Sign in
            </button>
            <button onClick={() => navigate('/auth')} className="btn-primary text-sm py-2 px-4">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-6">
                  <Zap className="w-3 h-3" />
                  Powered by Gemini AI · FlowZint Hackathon 2026
                </span>
                <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight mb-6">
                  Your Intelligent<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
                    Multilingual
                  </span><br />
                  Healthcare Assistant
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Understand symptoms, simplify medical information, and get guided healthcare assistance
                  instantly — in the language you're most comfortable with.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate('/auth')}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    Try MediBridge AI <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="#features" className="btn-secondary flex items-center justify-center gap-2">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-4 flex items-center justify-center lg:justify-start gap-1">
                  <Shield className="w-3 h-3" />
                  Informational use only · Not a medical diagnosis tool
                </p>
              </motion.div>
            </div>

            {/* Hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative w-full max-w-sm">
                {/* Chat preview card */}
                <div className="glass-card p-5 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">MediBridge AI</p>
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="chat-bubble-user text-sm">
                      मुझे बुखार और सिरदर्द है
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex-shrink-0 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <div className="chat-bubble-ai text-sm">
                        <p className="mb-2">I understand you have <strong>fever and headache</strong>. Let me help you.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge-moderate">Moderate Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <input
                      className="flex-1 bg-transparent text-xs text-slate-500 outline-none"
                      placeholder="Describe your symptoms..."
                      readOnly
                    />
                    <button className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -right-4 glass-card px-3 py-2 shadow-lg"
                >
                  <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
                    <Globe className="w-3 h-3" /> 5 Languages
                  </span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5 }}
                  className="absolute -bottom-4 -left-4 glass-card px-3 py-2 shadow-lg"
                >
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Activity className="w-3 h-3" /> Real-time Analysis
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((s) => (
              <div key={s.value} className="glass-card p-4 text-center">
                <p className="font-heading font-bold text-xl text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Features</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mt-2 mb-4">
              Everything you need for healthcare clarity
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              From symptom understanding to doctor preparation, MediBridge AI guides you at every step.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest">AI Workflow</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mt-2">
              How MediBridge AI works
            </h2>
          </motion.div>
          <div className="flex flex-col md:flex-row items-start justify-center gap-4">
            {[
              { step: '01', title: 'Describe', desc: 'Type or speak your symptoms in any supported language' },
              { step: '02', title: 'Analyze', desc: 'AI processes, extracts symptoms, and assesses urgency level' },
              { step: '03', title: 'Guide', desc: 'Receive clear, actionable next steps and healthcare guidance' },
              { step: '04', title: 'Prepare', desc: 'Export doctor summaries and prepare for your consultation' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                transition={{ delay: i * 0.15 }}
                className="flex-1 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-3 border border-blue-100">
                  <span className="font-heading font-bold text-blue-500">{item.step}</span>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute ml-28 mt-6 text-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-heading font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
              Trusted by patients & doctors
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-teal-500">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
            Take control of your health journey
          </h2>
          <p className="text-blue-100 mb-8">
            Start using MediBridge AI for free. No medical knowledge required.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white">MediBridge AI</span>
        </div>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          MediBridge AI is an informational assistance tool only and is not a replacement for
          professional medical advice. Always consult a qualified healthcare professional.
        </p>
        <p className="text-xs text-slate-600 mt-4">© 2026 MediBridge AI · Built for FlowZint AI Hackathon 2026</p>
      </footer>
    </div>
  )
}
