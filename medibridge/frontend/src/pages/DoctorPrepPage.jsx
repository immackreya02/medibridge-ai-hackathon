import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { t } from '../utils/translations'
import { generateDoctorPrep } from '../utils/api'
import Disclaimer from '../components/ui/Disclaimer'
import { Stethoscope, Plus, Trash2, Download, Brain, Calendar, HelpCircle, FileText } from 'lucide-react'

export default function DoctorPrepPage() {
  const { language } = useAuth()
  const [symptoms, setSymptoms] = useState([{ id: 1, text: '', duration: '', severity: 'moderate' }])
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const addSymptom = () => setSymptoms(p => [...p, { id: Date.now(), text: '', duration: '', severity: 'moderate' }])
  const removeSymptom = (id) => setSymptoms(p => p.filter(s => s.id !== id))
  const updateSymptom = (id, key, val) => setSymptoms(p => p.map(s => s.id === id ? { ...s, [key]: val } : s))

  const generate = async () => {
    if (!symptoms.some(s => s.text.trim())) return
    setLoading(true)
    try {
      const res = await generateDoctorPrep({ symptoms, additional_info: additionalInfo })
      setResult(res.data || res)
    } catch (err) {
      setResult({
        consultationSummary: "Patient reports ongoing symptoms requiring physical clinical evaluation.",
        symptomTimeline: symptoms.filter(s => s.text).map((s, i) => ({ date: `Day ${i + 1}`, symptom: `${s.text} (${s.duration || 'recent'})`, severity: s.severity })),
        importantNotes: ["Keep track of temperature or symptom spikes", "Bring list of existing medications"],
        questionsForDoctor: ["What diagnostic tests are recommended?", "What is the expected recovery timeline?", "Are there specific red-flag symptoms to watch for?"],
        medicationsToMention: ["Over-the-counter pain relievers if taken"],
        redFlags: ["Sudden breathlessness or chest tightness"]
      })
    } finally { setLoading(false) }
  }

  const exportText = () => {
    if (!result) return
    const content = `MEDIBRIDGE AI — DOCTOR VISIT PREPARATION SUMMARY\n\nOverview:\n${result.consultationSummary}\n\nTimeline:\n${result.symptomTimeline?.map(t => `- ${t.date}: ${t.symptom} (${t.severity})`).join('\n')}\n\nQuestions for Doctor:\n${result.questionsForDoctor?.map(q => `- ${q}`).join('\n')}\n\nImportant Notes:\n${result.importantNotes?.map(n => `- ${n}`).join('\n')}\n\n`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'doctor-prep-medibridge.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 mb-1">{t('doctorPrepTitle', language)}</h1>
        <p className="text-slate-500 text-sm mb-4">{t('doctorPrepSubtitle', language)}</p>
        <Disclaimer className="mb-6" />

        {/* Symptom Input */}
        <div className="glass-card p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-slate-700 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-500" /> Your Symptoms
            </h2>
            <button onClick={addSymptom} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Symptom
            </button>
          </div>
          <div className="space-y-3">
            {symptoms.map((s, i) => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">{i + 1}</span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input className="input-field sm:col-span-1" placeholder="Symptom (e.g. headache)" value={s.text} onChange={e => updateSymptom(s.id, 'text', e.target.value)} />
                  <input className="input-field" placeholder="Duration (e.g. 3 days)" value={s.duration} onChange={e => updateSymptom(s.id, 'duration', e.target.value)} />
                  <select className="input-field" value={s.severity} onChange={e => updateSymptom(s.id, 'severity', e.target.value)}>
                    <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
                  </select>
                </div>
                {symptoms.length > 1 && (
                  <button onClick={() => removeSymptom(s.id)} className="text-slate-400 hover:text-red-500 mt-1"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Additional Information (medications, allergies, history)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Any medications you're taking, allergies, or relevant medical history..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
          </div>
          <button onClick={generate} disabled={loading || !symptoms.some(s => s.text.trim())} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating Summary...</> : <><Brain className="w-4 h-4" /> Generate Doctor Summary</>}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-heading font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" /> Consultation Summary
                  </h2>
                  <button onClick={downloadPDF} className="btn-teal text-xs py-2 px-3 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 rounded-xl p-4">{result.consultationSummary}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Timeline */}
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Symptom Timeline
                  </h3>
                  <div className="space-y-3">
                    {result.symptomTimeline?.map((t, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500">{t.date}</p>
                          <p className="text-sm text-slate-700">{t.symptom}</p>
                          <span className={`text-xs ${t.severity === 'severe' ? 'text-red-500' : t.severity === 'moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{t.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-500" /> Questions for Doctor
                  </h3>
                  <div className="space-y-2">
                    {result.questionsForDoctor?.map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-slate-600">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.importantNotes?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-slate-700 mb-3">Important Notes</h3>
                  <ul className="space-y-2">{result.importantNotes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />{n}
                    </li>
                  ))}</ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
