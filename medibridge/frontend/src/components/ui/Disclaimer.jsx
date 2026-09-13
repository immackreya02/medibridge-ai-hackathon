import { Info } from 'lucide-react'

export default function Disclaimer({ className = '' }) {
  return (
    <div className={`disclaimer-banner ${className}`}>
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p>
        <strong>Medical Disclaimer:</strong> MediBridge AI is an informational assistance tool only
        and is not a replacement for professional medical advice. Always consult a qualified
        healthcare professional for medical decisions.
      </p>
    </div>
  )
}
