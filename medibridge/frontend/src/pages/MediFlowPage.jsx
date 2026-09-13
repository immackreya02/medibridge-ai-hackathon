import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { t } from '../utils/translations'
import {
  Activity, Play, AlertTriangle, CheckCircle, RotateCcw,
  Building2, UserCheck, ShieldAlert, Cpu, CheckCircle2,
  Clock, MapPin, Bed, ArrowRight, Sparkles, AlertCircle, FileCheck
} from 'lucide-react'
import {
  getMediFlowState,
  runMediFlowDecision,
  simulateMediFlowFailure,
  approveMediFlowReferral,
  resetMediFlowDemo
} from '../utils/api'

const MOCK_INITIAL_STATE = {
  patient: {
    id: "P-1024",
    name: "Rajesh Sharma",
    age: 64,
    condition: "Acute Respiratory Distress",
    required_specialty: "Pulmonology",
    urgency: "HIGH",
    requires_bed: true,
    vital_signs: {
      spO2: "89%",
      heart_rate: "112 bpm",
      respiratory_rate: "28 bpm"
    }
  },
  hospitals: [
    { id: "city_general", name: "City General Hospital", specialty: ["Pulmonology", "Emergency", "Cardiology"], available_beds: 2, load_percentage: 82, opd_wait_min: 40, distance_km: 4.2, status: "AVAILABLE" },
    { id: "metro_care", name: "Metro Care Hospital", specialty: ["Pulmonology", "Neurology", "ICU"], available_beds: 3, load_percentage: 72, opd_wait_min: 25, distance_km: 7.1, status: "AVAILABLE" },
    { id: "community_medical", name: "Community Medical Centre", specialty: ["General Medicine", "Pediatrics"], available_beds: 8, load_percentage: 60, opd_wait_min: 20, distance_km: 5.5, status: "AVAILABLE" }
  ],
  agent_status: "ONLINE",
  current_step: "IDLE",
  recommendation: null,
  previous_recommendation: null,
  verification: { status: "UNVERIFIED", details: null },
  approval_status: "PENDING",
  failure_occurred: false,
  tool_logs: [],
  current_plan: [
    { step: 1, title: "Assess Patient Requirements", status: "pending" },
    { step: 2, title: "Retrieve Network Capacity", status: "pending" },
    { step: 3, title: "Evaluate & Rank Hospitals", status: "pending" },
    { step: 4, title: "Select Target Hospital", status: "pending" },
    { step: 5, title: "Verify Bed & Specialty Capability", status: "pending" }
  ]
}

export default function MediFlowPage() {
  const { language } = useAuth()
  const [state, setState] = useState(MOCK_INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [actionLabel, setActionLabel] = useState('')

  const fetchState = async () => {
    try {
      const res = await getMediFlowState()
      if (res.data) setState(res.data)
    } catch (err) {
      console.warn('Backend API connection failed, using local MediFlow state:', err)
    }
  }

  useEffect(() => {
    fetchState()
  }, [])

  const handleRunDecision = async () => {
    setLoading(true)
    setActionLabel('MediFlow Agent evaluating hospital network...')
    try {
      const res = await runMediFlowDecision()
      if (res.data) setState(res.data)
      toast.success('Agentic evaluation completed! City General recommended.')
    } catch (err) {
      // Local fallback for run decision
      const selected = state.hospitals.find(h => h.id === 'city_general') || state.hospitals[0]
      setState(prev => ({
        ...prev,
        agent_status: 'COMPLETED',
        current_step: 'AWAITING_APPROVAL',
        recommendation: selected,
        verification: { status: 'VERIFIED', details: 'Hospital has 2 available beds & Pulmonology ward' },
        current_plan: (prev.current_plan || []).map(p => ({ ...p, status: 'completed' })),
        tool_logs: [
          { tool: 'get_patient_details', action: 'Retrieve clinical requirements', output: 'Pulmonology | HIGH Urgency | Bed Required', status: 'success' },
          { tool: 'get_hospital_capacity', action: 'Scan network capacity', output: 'City General (2 beds), Metro Care (3 beds), Community Medical (8 beds)', status: 'success' },
          { tool: 'evaluate_hospitals', action: 'Rank hospitals', output: 'Selected City General Hospital (Nearest 4.2km with matching Pulmonology unit)', status: 'success' },
          { tool: 'verify_recommendation', action: 'Verify bed availability', output: 'Result: VERIFIED - Bed & Specialty confirmed', status: 'success' }
        ]
      }))
      toast.success('Agentic evaluation completed! City General recommended.')
    } finally {
      setLoading(false)
      setActionLabel('')
    }
  }

  const handleSimulateFailure = async () => {
    setLoading(true)
    setActionLabel('Simulating hospital capacity failure & agent adaptation...')
    try {
      const res = await simulateMediFlowFailure()
      if (res.data) setState(res.data)
      toast.error('City General FULL! Agent adapted to Metro Care Hospital.', { icon: '⚠' })
    } catch (err) {
      const metroCare = state.hospitals.find(h => h.id === 'metro_care')
      const updatedHospitals = state.hospitals.map(h => h.id === 'city_general' ? { ...h, available_beds: 0, load_percentage: 100, status: 'FULL / UNAVAILABLE' } : h)
      setState(prev => ({
        ...prev,
        hospitals: updatedHospitals,
        failure_occurred: true,
        previous_recommendation: prev.recommendation || prev.hospitals.find(h => h.id === 'city_general'),
        recommendation: metroCare,
        agent_status: 'COMPLETED',
        current_step: 'ADAPTED_AWAITING_APPROVAL',
        approval_status: 'PENDING',
        verification: { status: 'VERIFIED', details: 'Metro Care Hospital has 3 available Pulmonology beds' },
        tool_logs: [
          ...(prev.tool_logs || []),
          { tool: 'verify_recommendation', action: 'Periodic check on City General', output: 'FAILED: City General status updated to FULL (0 beds available)', status: 'error' },
          { tool: 'agent_controller', action: 'Invalidate recommendation', output: '⚠ Recommendation Invalidated: Primary target City General is FULL', status: 'warning' },
          { tool: 'search_alternative_hospitals', action: 'Search Pulmonology alternatives', output: 'Found qualified candidate: Metro Care Hospital', status: 'success' },
          { tool: 'verify_recommendation', action: 'Verify alternative bed availability', output: 'Result: VERIFIED - Metro Care Pulmonology bed confirmed', status: 'success' }
        ]
      }))
      toast.error('City General FULL! Agent adapted to Metro Care Hospital.', { icon: '⚠' })
    } finally {
      setLoading(false)
      setActionLabel('')
    }
  }

  const handleApproveReferral = async () => {
    setLoading(true)
    try {
      const res = await approveMediFlowReferral()
      if (res.data) setState(res.data)
      toast.success('Referral recommendation approved by hospital staff!')
    } catch (err) {
      setState(prev => ({
        ...prev,
        approval_status: 'APPROVED',
        tool_logs: [
          ...(prev.tool_logs || []),
          { tool: 'human_in_the_loop', action: 'Hospital staff referral sign-off', output: '✓ Referral Approved by hospital staff. Admission order transmitted.', status: 'success' }
        ]
      }))
      toast.success('Referral recommendation approved by hospital staff!')
    } finally {
      setLoading(false)
    }
  }

  const handleResetDemo = async () => {
    setLoading(true)
    try {
      const res = await resetMediFlowDemo()
      if (res.data) setState(res.data)
      toast.success('MediFlow demo state reset.')
    } catch (err) {
      setState(MOCK_INITIAL_STATE)
      toast.success('MediFlow demo state reset.')
    } finally {
      setLoading(false)
    }
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="flex items-center gap-3 text-slate-500">
          <Activity className="w-6 h-6 animate-spin text-blue-500" />
          <span>Initializing MediFlow Orchestrator...</span>
        </div>
      </div>
    )
  }

  const {
    patient = MOCK_INITIAL_STATE.patient,
    hospitals = MOCK_INITIAL_STATE.hospitals,
    agent_status = 'ONLINE',
    recommendation = null,
    previous_recommendation = null,
    verification = { status: 'UNVERIFIED', details: null },
    approval_status = 'PENDING',
    failure_occurred = false,
    tool_logs = [],
    current_plan = MOCK_INITIAL_STATE.current_plan
  } = state

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold font-heading text-slate-900">{t('mediflowTitle', language)}</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              DEMO MODE — SIMULATED DATA
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            {t('mediflowSubtitle', language)}
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunDecision}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {t('runAgentBtn', language)}
          </button>

          <button
            onClick={handleSimulateFailure}
            disabled={loading || !recommendation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-sm border border-amber-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t('simulateFailureBtn', language)}
          </button>

          <button
            onClick={handleApproveReferral}
            disabled={loading || !recommendation || approval_status === 'APPROVED'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border cursor-pointer ${
              approval_status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
            } disabled:opacity-50`}
          >
            <CheckCircle className="w-4 h-4" />
            {approval_status === 'APPROVED' ? '✓ Referral Approved' : t('approveReferralBtn', language)}
          </button>

          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t('resetDemoBtn', language)}
          </button>
        </div>
      </div>

      {loading && actionLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 text-blue-700 text-sm font-medium"
        >
          <Activity className="w-4 h-4 animate-spin" />
          <span>{actionLabel}</span>
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Patient & Clinical Goal (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulated Demo Patient</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                Urgency: {patient?.urgency || 'HIGH'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                P
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{patient?.name} ({patient?.id})</h3>
                <p className="text-xs text-slate-500">Age: {patient?.age} years | Admission Required: YES</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical Condition:</span>
                <span className="font-semibold text-slate-800">{patient?.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Required Specialty:</span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{patient?.required_specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-medium text-slate-700">Hospital Staff / Referral Coordinator</span>
              </div>
            </div>

            {/* Vitals */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-xs text-slate-400">SpO2</span>
                <span className="text-xs font-bold text-red-600">{patient?.vital_signs?.spO2 || '89%'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Heart Rate</span>
                <span className="text-xs font-bold text-slate-700">{patient?.vital_signs?.heart_rate || '112 bpm'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Resp Rate</span>
                <span className="text-xs font-bold text-slate-700">{patient?.vital_signs?.respiratory_rate || '28 bpm'}</span>
              </div>
            </div>
          </div>

          {/* Goal Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Agentic Orchestration Goal</span>
            </div>
            <p className="text-sm font-medium text-slate-200 mb-3">
              Route patient P-1024 to the nearest verified Pulmonology bed, avoiding congested OPDs and re-planning dynamically if capacity fails.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Status: {agent_status}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Stepper, Tools Log & Recommendation (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Recommendation & Human Approval Hero Banner */}
          <div className={`p-6 rounded-2xl border transition-all shadow-sm ${
            failure_occurred
              ? 'bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 border-amber-200'
              : recommendation
                ? 'bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/50 border-blue-200'
                : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className={`w-5 h-5 ${recommendation ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Agentic Recommendation</span>
              </div>

              {verification?.status === 'VERIFIED' && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  VERIFIED RECOMMENDATION
                </span>
              )}
            </div>

            {/* Failure Alert Banner when failure occurred */}
            {failure_occurred && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ⚠ Recommendation Invalidated: City General Hospital is now FULL / UNAVAILABLE
                </div>
                <p className="text-amber-700">
                  MediFlow Agent detected capacity failure, retrieved updated network metrics, re-evaluated Pulmonology candidates, and adapted recommendation.
                </p>
              </div>
            )}

            {recommendation ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{recommendation.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specialties: {Array.isArray(recommendation.specialty) ? recommendation.specialty.join(', ') : recommendation.specialty} | Distance: {recommendation.distance_km} km
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-sm shadow-emerald-500/20">
                      {recommendation.available_beds} Pulmonology Beds Available
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 block">OPD Wait Time</span>
                    <span className="font-bold text-slate-700">{recommendation.opd_wait_min} mins</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 block">Hospital Load</span>
                    <span className="font-bold text-slate-700">{recommendation.load_percentage}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 block">Specialty Match</span>
                    <span className="font-bold text-emerald-600">✓ Verified Match</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-400 block">Staff Sign-off</span>
                    <span className={`font-bold ${approval_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {approval_status === 'APPROVED' ? '✓ Approved' : 'Awaiting Approval'}
                    </span>
                  </div>
                </div>

                {/* Human-in-the-Loop Action Strip */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>
                      {approval_status === 'APPROVED'
                        ? '✓ Referral recommendation approved by hospital staff.'
                        : 'Human-in-the-Loop: Awaiting hospital staff review and sign-off.'}
                    </span>
                  </div>
                  {approval_status !== 'APPROVED' && (
                    <button
                      onClick={handleApproveReferral}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve Referral
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm space-y-2">
                <Cpu className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
                <p>Click <strong>"Run MediFlow Decision"</strong> to initiate the agentic routing workflow.</p>
              </div>
            )}
          </div>

          {/* Current Execution Plan Steps */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Agentic Execution Plan</span>
              <span className="text-xs text-slate-400 font-mono">Steps: {(current_plan || []).length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(current_plan || []).map((step) => (
                <div
                  key={step.step}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-xs transition-all ${
                    step.status === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : step.status === 'failed'
                        ? 'bg-red-50/60 border-red-200 text-red-900'
                        : step.status === 'active'
                          ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    step.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : step.status === 'failed'
                        ? 'bg-red-600 text-white'
                        : step.status === 'active'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.step}
                  </div>
                  <span className="truncate flex-1">{step.title}</span>
                  {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  {step.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Live Tool Execution Log */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-sm space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Tool Activity & Agent Execution Log</span>
              </div>
              <span className="text-[11px] text-slate-500">{(tool_logs || []).length} tool calls logged</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 text-xs pr-1">
              {(tool_logs || []).length === 0 ? (
                <div className="text-slate-500 italic text-center py-4">No tools executed yet.</div>
              ) : (
                (tool_logs || []).map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                      log.status === 'error'
                        ? 'bg-red-950/40 border-red-800/60 text-red-300'
                        : log.status === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                          : 'bg-slate-800/70 border-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-bold text-blue-400">🛠 tool: {log.tool}()</span>
                      <span className="uppercase text-[10px] tracking-wider text-slate-400 font-semibold">{log.action}</span>
                    </div>
                    <p className="text-slate-200 font-sans">{log.output}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Hospital Network Comparison Cards */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-slate-900">Hospital Network Capacity Grid</h2>
          <span className="text-xs text-slate-500">Live monitoring of regional healthcare nodes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(hospitals || []).map((h) => {
            const isRecommended = recommendation?.id === h.id
            const isPrevFull = failure_occurred && h.id === 'city_general'

            return (
              <div
                key={h.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isRecommended
                    ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                    : isPrevFull
                      ? 'bg-red-50/40 border-red-200 opacity-90'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{h.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {h.distance_km} km away
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    h.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {h.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Specialties:</span>
                    <span className="font-medium text-slate-800">{Array.isArray(h.specialty) ? h.specialty.join(', ') : h.specialty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Available Beds:</span>
                    <span className={`font-bold text-sm ${h.available_beds > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {h.available_beds} beds
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Hospital Load:</span>
                    <span className="font-bold text-slate-700">{h.load_percentage}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">OPD Wait Time:</span>
                    <span className="font-medium text-slate-700">{h.opd_wait_min} mins</span>
                  </div>
                </div>

                {isRecommended && (
                  <div className="p-2 rounded-xl bg-emerald-600 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    RECOMMENDED & VERIFIED
                  </div>
                )}

                {isPrevFull && (
                  <div className="p-2 rounded-xl bg-red-100 text-red-800 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    UNAVAILABLE (0 BEDS)
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
