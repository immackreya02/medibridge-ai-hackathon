import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { sendMessage as sendMessageApi } from '../utils/api'
import Disclaimer from '../components/ui/Disclaimer'
import RiskBadge from '../components/ui/RiskBadge'
import {
  Send, Mic, MicOff, Plus, Globe, Lightbulb, AlertCircle,
  MessageSquare, Clock, Trash2, Brain
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' }, { code: 'mr', label: 'मराठी' }, { code: 'te', label: 'తెలుగు' }
]

const SUGGESTIONS = [
  'I have a fever and headache for 2 days',
  'My chest feels tight and I feel breathless',
  'I have stomach pain after eating',
  'Help me understand my blood test report',
]

const SYSTEM_PROMPT = `You are MediBridge AI, a multilingual healthcare assistant. Your role is to:
1. Understand symptoms described by users
2. Assess urgency level: low / moderate / high / emergency
3. Provide clear, calm, helpful guidance
4. ALWAYS recommend consulting a doctor for proper diagnosis
5. NEVER diagnose diseases
6. Detect emergency situations immediately

ALWAYS end your response with a JSON block like this (on a new line):
\`\`\`json
{"risk": "low|moderate|high|emergency", "symptoms": ["symptom1"], "nextSteps": ["step1","step2"]}
\`\`\`

Be empathetic and professional. If the user writes in Hindi, Tamil, Marathi, or Telugu, understand it and respond in English with a note that you understood their language.`

export default function ChatPage() {
  const { user, language, setLanguage } = useAuth()
  const [messages, setMessages] = useState([{
    id: 1, role: 'assistant',
    content: "Hello! I'm MediBridge AI. I'm here to help you understand your symptoms and guide you on your healthcare journey. Please describe how you're feeling — you can type in English, Hindi, Tamil, Marathi, or Telugu.",
    risk: null, timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLangState] = useState(language || 'en')

  useEffect(() => {
    if (language && language !== lang) setLangState(language)
  }, [language])

  const setLang = (code) => {
    setLangState(code)
    if (setLanguage) setLanguage(code)
  }
  const [listening, setListening] = useState(false)
  const [sessions, setSessions] = useState([{ id: 1, title: 'Current Session', time: 'now' }])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const extractJSON = (text) => {
    try {
      const match = text.match(/```json\n([\s\S]*?)\n```/)
      if (match) return JSON.parse(match[1])
    } catch {}
    return null
  }

  const cleanContent = (text) => text.replace(/```json[\s\S]*?```/g, '').trim()

  const getLocalFallback = (text) => {
    const tLower = text.toLowerCase()
    if (tLower.includes('chest pain') || tLower.includes('breathless') || tLower.includes('shortness of breath')) {
      return {
        content: "⚠️ **EMERGENCY WARNING**: Symptoms like chest pain and breathlessness require immediate emergency medical care. Please call emergency services (112) or go to the nearest emergency room immediately.",
        risk: 'emergency',
        symptoms: ['Chest Pain', 'Shortness of Breath'],
        nextSteps: ['Call Emergency Services (112)', 'Do not drive yourself', 'Rest until medical help arrives']
      }
    }
    if (tLower.includes('fever') || tLower.includes('headache') || tLower.includes('vomit')) {
      return {
        content: "I understand you are experiencing fever / discomfort. Make sure to stay well-hydrated, rest, and consult a general physician if symptoms persist or worsen.",
        risk: 'moderate',
        symptoms: ['Fever / Headache'],
        nextSteps: ['Schedule a GP consultation', 'Monitor body temperature', 'Stay hydrated']
      }
    }
    return {
      content: "Thank you for reaching out to MediBridge AI. Please share details about how long you've had these symptoms, their severity, and any other relevant health history.",
      risk: 'low',
      symptoms: ['General Inquiry'],
      nextSteps: ['Track symptom progression', 'Consult a doctor for advice']
    }
  }

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await sendMessageApi({ message: text, history, language: lang })
      const data = res.data || res
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: cleanContent(data.content || 'Thank you for your message. How else can I assist you?'),
        risk: data.risk || 'low',
        nextSteps: data.nextSteps || [],
        symptoms: data.symptoms || [],
        timestamp: new Date()
      }
      setMessages(p => [...p, aiMsg])
    } catch (err) {
      console.warn('Backend API connection failed, using local symptom evaluator fallback:', err)
      const fb = getLocalFallback(text)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: fb.content,
        risk: fb.risk,
        nextSteps: fb.nextSteps,
        symptoms: fb.symptoms,
        timestamp: new Date()
      }
      setMessages(p => [...p, aiMsg])
    } finally { setLoading(false) }
  }

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) { alert('Voice not supported in this browser'); return }
    if (listening) { setListening(false); return }
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'te' ? 'te-IN' : lang === 'mr' ? 'mr-IN' : 'en-US'
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false) }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start(); setListening(true)
  }

  const EmergencyBanner = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 emergency-ring">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-700 text-sm">⚠️ Emergency Situation Detected</p>
        <p className="text-red-600 text-xs mt-1">Please call emergency services immediately: <strong>112</strong> (India) or go to the nearest emergency room.</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <button onClick={() => setMessages([{ id: Date.now(), role: 'assistant', content: "Hello! I'm MediBridge AI. How can I help you today?", timestamp: new Date() }])}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-400 font-medium px-2 mb-2">CHAT HISTORY</p>
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 cursor-pointer mb-1">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{s.title}</p>
                <p className="text-xs text-blue-400 flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium px-2 mb-2">LANGUAGE</p>
          <div className="flex flex-wrap gap-1.5 px-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`text-xs px-2 py-1 rounded-lg transition-all ${lang === l.code ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">MediBridge AI</p>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={e => setLang(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <Disclaimer className="mb-2" />
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`flex flex-col gap-2 max-w-xs sm:max-w-lg lg:max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'assistant' && msg.risk === 'emergency' && <EmergencyBanner />}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.role === 'assistant'
                      ? <ReactMarkdown className="prose prose-sm prose-slate max-w-none text-sm">{msg.content}</ReactMarkdown>
                      : <p className="text-sm">{msg.content}</p>}
                  </div>
                  {msg.role === 'assistant' && msg.risk && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskBadge level={msg.risk} />
                      {msg.nextSteps?.length > 0 && (
                        <span className="text-xs text-slate-400">{msg.nextSteps[0]}</span>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-slate-300">{msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-1.5 px-4 py-3">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 sm:px-6 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-all">
                <Lightbulb className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              rows={1}
              placeholder="Describe your symptoms... (Press Enter to send)"
              className="flex-1 resize-none outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent max-h-32"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleVoice}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
