import { AlertTriangle, AlertCircle, CheckCircle, Activity } from 'lucide-react'

const config = {
  low: { cls: 'badge-low', icon: CheckCircle, label: 'Low Risk' },
  moderate: { cls: 'badge-moderate', icon: Activity, label: 'Moderate' },
  high: { cls: 'badge-high', icon: AlertTriangle, label: 'High Risk' },
  emergency: { cls: 'badge-emergency', icon: AlertCircle, label: 'EMERGENCY' },
}

export default function RiskBadge({ level = 'low' }) {
  const { cls, icon: Icon, label } = config[level] || config.low
  return (
    <span className={cls}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
