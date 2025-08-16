import { Heart } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Heart className="w-5 h-5 text-white fill-white" />
      </div>
      {showText && (
        <div>
          <h1 className="font-bold text-lg text-white">Plantão Médico</h1>
          <p className="text-sm text-blue-300">Sistema Profissional</p>
        </div>
      )}
    </div>
  )
}
