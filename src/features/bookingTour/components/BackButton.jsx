import { ArrowLeft } from 'lucide-react'

export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 text-[var(--maincolor)] text-xl">
      <ArrowLeft className="size-6" />
      {label}
    </button>
  )
}
