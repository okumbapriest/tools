import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helper, className = '', ...props }, ref) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 ${
        error ? 'border-red-400' : 'border-slate-300'
      } ${(props as any).className || ''}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {helper && !error && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
  </div>
))
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

const Select = ({ label, options, placeholder, className = '', ...props }: SelectProps) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select
      {...props}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const TextArea = ({ label, className = '', ...props }: TextAreaProps) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <textarea
      {...props}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-blue-100 resize-y min-h-[80px]"
    />
  </div>
)

export { Input, Select, TextArea }
