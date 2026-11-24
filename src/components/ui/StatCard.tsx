import React, { type ReactNode } from 'react'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: { label: string; positive: boolean }
  href?: string
  accent?: boolean
  warning?: boolean
}

export function StatCard({ title, value, icon, trend, href, accent, warning }: StatCardProps) {
  const content = (
    <div className={`rounded-xl p-5 ${
      accent ? 'bg-brand-blue text-white shadow-lg shadow-blue-200'
      : warning ? 'bg-white border border-red-200 shadow-sm'
      : 'bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-colors'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${accent ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${accent ? 'text-white' : 'text-charcoal'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          accent ? 'bg-white/20' : warning ? 'bg-red-100' : 'bg-slate-100'
        }`}>
          {icon}
        </div>
      </div>
      {trend && (
        <p className={`text-xs mt-3 ${trend.positive ? (accent ? 'text-blue-100' : 'text-green-600') : (accent ? 'text-blue-100' : 'text-red-600')}`}>
          {trend.label}
        </p>
      )}
    </div>
  )
  return href ? <Link href={href} passHref>{content}</Link> : content
}
