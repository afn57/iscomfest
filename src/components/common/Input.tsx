import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'

const BASE =
  'w-full rounded-xl bg-surface-2 border border-line px-3.5 text-sm text-ink placeholder:text-ink-muted ' +
  'transition-colors duration-150 hover:border-line-strong focus:border-primary focus:outline-none ' +
  'focus:ring-2 focus:ring-primary/25 disabled:opacity-50 disabled:cursor-not-allowed'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1.5 flex items-baseline gap-1 text-[13px] font-medium text-ink-soft">
          {label}
          {required && <span className="text-danger">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] text-ink-muted">{hint}</span>
      ) : null}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export function Input({ icon, className, ...rest }: InputProps) {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted [&>svg]:size-4">
          {icon}
        </span>
        <input className={cn(BASE, 'h-10 pl-9', className)} {...rest} />
      </div>
    )
  }
  return <input className={cn(BASE, 'h-10', className)} {...rest} />
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(BASE, 'py-2.5 leading-relaxed resize-y', className)} {...rest} />
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(BASE, 'h-10 pl-3.5 pr-9 appearance-none cursor-pointer', className)}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}
