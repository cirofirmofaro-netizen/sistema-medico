import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, children, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0">
          {children}
        </div>
      )}
    </div>
  )
}
