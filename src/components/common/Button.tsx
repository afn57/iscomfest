import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white border border-primary hover:bg-primary-strong active:translate-y-px shadow-[0_6px_20px_-10px_var(--primary)]',
  secondary:
    'bg-surface-3 text-ink border border-line-strong hover:border-primary/50 hover:text-primary active:translate-y-px',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-surface-2 hover:text-ink',
  outline:
    'bg-transparent text-ink border border-line-strong hover:bg-surface-2 hover:border-primary/50',
  danger: 'bg-danger text-white border border-danger hover:opacity-90 active:translate-y-px',
  accent: 'bg-accent text-[#05202a] border border-accent hover:opacity-90 active:translate-y-px',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0 [&>svg]:size-4">{icon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {iconRight && !loading && <span className="shrink-0 [&>svg]:size-4">{iconRight}</span>}
    </button>
  )
}
