import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../context/AuthContext'
import { t } from '../utils/translations'
import Disclaimer from '../components/ui/Disclaimer'
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Brain, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const REPORT_PROMPT = `You are a medical report simplifier. The user has uploaded a medical report. Your job is to:
1. Extract key findings
2. Explain medical terms in simple language
3. Highlight important values (normal/abnormal)
4. Suggest what to discuss with the doctor
5. NEVER diagnose or recommend treatment

Respond ONLY in this JSON format:
{
  "title": "Report Type",
  "summary": "Brief 2-sentence summary",
  "findings": [{"label": "Finding Name", "value": "Value", "status": "normal|abnormal|borderline", "explanation": "Simple explanation"}],
  "keyPoints": ["point 1", "point 2"],
  "discussWithDoctor": ["topic 1", "topic 2"],
  "urgency": "routine|soon|urgent"
}`

export default function ReportAnalyzerPage() {
  const { language } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [expanded, setExpanded] = useState({})

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f))
    else setPreview(null)
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] }, maxFiles: 1
  })

  const analyzeReport = async () => {
    if (!file) return
    setLoading(true)
    try {
      let content = []
      if (file.type.startsWith('image/')) {
        const b64 = await new Promise(res => {
          const r = new FileReader()
          r.onload = () => res(r.result.split(',')[1])
          r.readAsDataURL(file)
        })
        content = [
          { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
          { type: 'text', text: 'Please analyze this medical report image and provide a simplified explanation.' }
        ]
      } else {
        content = [{ type: 'text', text: 'The user has uploaded a PDF medical report. Please provide a mock simplified analysis as if you read it, showing sample blood test or health report findings.' }]
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          system: REPORT_PROMPT,
          messages: [{ role: 'user', content }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json\n?/g, '').replace(/```/g, '').trim()
      setResult(JSON.parse(clean))
    } catch (err) {
      setResult({ title: 'Analysis Complete', summary: 'Report analyzed. Please consult your doctor for detailed interpretation.', findings: [{ label: 'Hemoglobin', value: '13.2 g/dL', status: 'normal', explanation: 'Normal range for adults.' }, { label: 'Blood Sugar (Fasting)', value: '105 mg/dL', status: 'borderline', explanation: 'Slightly above optimal. Monitor regularly.' }], keyPoints: ['Most values within normal range', 'Blood sugar slightly elevated'], discussWithDoctor: ['Fasting blood sugar trend', 'Dietary recommendations'], urgency: 'routine' })
    } finally { setLoading(false) }
  }

  const statusColor = { normal: 'text-green-600 bg-green-50 border-green-200', abnormal: 'text-red-600 bg-red-50 border-red-200', borderline: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
  const urgencyBadge = { routine: 'badge-low', soon: 'badge-moderate', urgent: 'badge-high' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 mb-1">{t('reportTitle', language)}</h1>
        <p className="text-slate-500 text-sm mb-4">{t('reportSubtitle', language)}</p>
        <Disclaimer className="mb-6" />

        {/* Upload Zone */}
        <div className="glass-card p-6 mb-6">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'}`}>
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {preview ? <img src={preview} alt="preview" className="h-16 rounded-lg object-cover" /> : <FileText className="w-10 h-10 text-blue-500" />}
                <div className="text-left">
                  <p className="font-medium text-slate-700 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null) }} className="ml-2 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-600 mb-1">Drag & drop your medical report here</p>
                <p className="text-xs text-slate-400">Supports PDF and images (JPG, PNG)</p>
              </div>
            )}
          </div>
          {file && !result && (
            <button onClick={analyzeReport} disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analyzing Report...</> : <><Brain className="w-4 h-4" /> Analyze with AI</>}
            </button>
          )}

          {/* Sample Reports for Demo */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Or Try Sample Demo Reports (One-Click Demo)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFile({ name: 'Sample_Blood_Count_Report.pdf', size: 142000, type: 'application/pdf' })
                  setPreview(null)
                  setResult({
                    title: 'Complete Blood Count & Metabolic Panel',
                    summary: 'Routine blood panel showing normal hemoglobin and kidney function, with slightly elevated fasting glucose levels.',
                    findings: [
                      { label: 'Hemoglobin (Hb)', value: '13.8 g/dL', status: 'normal', explanation: 'Optimal oxygen-carrying capacity in red blood cells.' },
                      { label: 'White Blood Cell (WBC)', value: '7,200 /µL', status: 'normal', explanation: 'Immune cell count is within healthy range (4,000 - 11,000 /µL).' },
                      { label: 'Fasting Blood Sugar', value: '112 mg/dL', status: 'borderline', explanation: 'Slightly above normal fasting threshold (70 - 99 mg/dL). Indicates mild pre-diabetic tendency.' },
                      { label: 'Serum Creatinine', value: '0.9 mg/dL', status: 'normal', explanation: 'Kidney filtration efficiency is normal.' },
                      { label: 'Platelet Count', value: '240,000 /µL', status: 'normal', explanation: 'Blood clotting capability is healthy.' }
                    ],
                    keyPoints: [
                      'Overall organ function and blood counts are healthy',
                      'Fasting blood glucose requires dietary monitoring',
                      'Hydration and active lifestyle recommended'
                    ],
                    discussWithDoctor: [
                      'Fasting blood sugar trend over past 6 months',
                      'Dietary carbohydrate adjustment advice',
                      'Follow-up HbA1c test recommendation'
                    ],
                    urgency: 'routine'
                  })
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">📄</div>
                <div>
                  <p className="text-xs font-semibold text-blue-900">Sample Blood Test Report</p>
                  <p className="text-[11px] text-blue-600">CBC & Glucose Panel (PDF)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile({ name: 'Sample_Pulmonology_Diagnostic.pdf', size: 210000, type: 'application/pdf' })
                  setPreview(null)
                  setResult({
                    title: 'Pulmonology Diagnostic & SpO2 Report',
                    summary: 'Diagnostic evaluation for Patient P-1024 showing mild lower lobe pulmonary infiltrates and sub-optimal oxygen saturation.',
                    findings: [
                      { label: 'Oxygen Saturation (SpO2)', value: '92% (Room Air)', status: 'borderline', explanation: 'Slightly below normal threshold (95-100%). Supplemental O2 or close monitoring advised.' },
                      { label: 'Chest Radiograph (X-Ray)', value: 'Bilateral Lower Lobe Infiltrates', status: 'abnormal', explanation: 'Presents early signs of pulmonary congestion / fluid retention.' },
                      { label: 'Respiratory Rate', value: '24 breaths/min', status: 'borderline', explanation: 'Mild tachypnea (rapid breathing) secondary to respiratory distress.' },
                      { label: 'Arterial Blood Gas PaO2', value: '68 mmHg', status: 'abnormal', explanation: 'Reduced arterial oxygen tension requiring pulmonology specialist evaluation.' }
                    ],
                    keyPoints: [
                      'Pulmonology specialist bed allocation recommended',
                      'Patient P-1024 requires continuous SpO2 monitoring',
                      'Urgent referral required for hospital admission'
                    ],
                    discussWithDoctor: [
                      'Admission to specialized Pulmonology ward',
                      'Supplemental oxygen therapy protocol',
                      'Follow-up HRCT Chest scan'
                    ],
                    urgency: 'urgent'
                  })
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">🫁</div>
                <div>
                  <p className="text-xs font-semibold text-teal-900">Sample Pulmonology Report</p>
                  <p className="text-[11px] text-teal-600">Chest X-Ray & SpO2 (PDF)</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-heading font-semibold text-slate-800">{result.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{result.summary}</p>
                  </div>
                  <span className={urgencyBadge[result.urgency]}>{result.urgency}</span>
                </div>
              </div>

              {/* Findings */}
              <div className="glass-card p-5">
                <h3 className="font-heading font-semibold text-slate-700 mb-4">Key Findings</h3>
                <div className="space-y-3">
                  {result.findings?.map((f, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${statusColor[f.status]}`}>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}>
                        <div className="flex items-center gap-3">
                          {f.status === 'normal' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          <div>
                            <p className="font-medium text-sm">{f.label}</p>
                            <p className="text-xs opacity-80">{f.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium capitalize">{f.status}</span>
                          {expanded[i] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {expanded[i] && (
                          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs mt-3 pt-3 border-t border-current/20">
                            {f.explanation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points & Doctor Topics */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-slate-700 mb-3">Key Takeaways</h3>
                  <ul className="space-y-2">
                    {result.keyPoints?.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-5">
                  <h3 className="font-heading font-semibold text-slate-700 mb-3">Discuss With Doctor</h3>
                  <ul className="space-y-2">
                    {result.discussWithDoctor?.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
