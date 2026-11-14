'use client'

/**
 * Teacher UI kit
 * ----------------
 * Small, dependency-free primitives shared by every teacher screen so that
 * buttons, badges, cards, fields, dialogs and feedback messages look and behave
 * the same everywhere (Nielsen #4 — consistency and standards).
 *
 * All styles live in `app/teacher.css` under the `.tch` scope and use the
 * `t-` class prefix so they never collide with the student/parent styles.
 */

import { useEffect, useId, useRef } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'

/* ------------------------------------------------------------------ helpers */

/** Joins class names, skipping falsy values. */
export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(' ')

/** Initials used by avatars, e.g. "Malak Adel" -> "MA". */
export const initials = (name: string) => name.split(' ').map((word) => word[0]).join('')

/** One date format for the whole teacher view, e.g. "Oct 18, 2026". */
export const formatDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? isoDate : parsed.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

/**
 * Maps an understanding state to one colour everywhere it appears, so a
 * "Surprise mistake" is always red and "Secure" is always green.
 */
export const stateTone = (state: string): Tone =>
  state === 'Secure' ? 'success' : state === 'Surprise mistake' ? 'danger' : state === 'Known gap' || state === 'Wobbly' ? 'warning' : 'neutral'

/* ------------------------------------------------------------------ actions */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', icon, ariaLabel, block = false }: {
  children?: React.ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  icon?: React.ReactNode
  ariaLabel?: string
  block?: boolean
}) {
  return <button type={type} className={cx('t-btn', `t-btn-${variant}`, size === 'sm' && 't-btn-sm', block && 't-btn-block', !children && 't-btn-icon')} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
    {icon}{children}
  </button>
}

/** Text-style link button used for secondary navigation ("View all →"). */
export function LinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className="t-link" onClick={onClick}>{children}</button>
}

/* ----------------------------------------------------------------- display */

export function Badge({ children, tone = 'neutral', dot = false }: { children: React.ReactNode; tone?: Tone; dot?: boolean }) {
  return <span className={cx('t-badge', `t-badge-${tone}`)}>{dot && <i aria-hidden="true" />}{children}</span>
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={cx('t-avatar', `t-avatar-${size}`)} aria-hidden="true">{initials(name)}</span>
}

/** Card surface. `padded={false}` lets lists and tables run edge to edge. */
export function Card({ children, className, padded = true, as: Tag = 'section' }: { children: React.ReactNode; className?: string; padded?: boolean; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cx('t-card', padded && 't-card-padded', className)}>{children}</Tag>
}

/** Consistent card title row: title + optional description on the left, meta/actions on the right. */
export function CardHeader({ title, description, action, step }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; step?: number }) {
  return <header className="t-card-header">
    {step !== undefined && <span className="t-step-number" aria-hidden="true">{step}</span>}
    <div className="t-card-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>
    {action && <div className="t-card-actions">{action}</div>}
  </header>
}

export function ProgressBar({ value, label, tone = 'accent' }: { value: number; label: string; tone?: Tone }) {
  const clamped = Math.max(0, Math.min(100, value))
  return <div className={cx('t-progress', `t-progress-${tone}`)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)}><span style={{ width: `${clamped}%` }} /></div>
}

export function StatCard({ label, value, detail, icon, onClick }: { label: string; value: React.ReactNode; detail: string; icon: React.ReactNode; onClick?: () => void }) {
  const body = <><span className="t-stat-icon" aria-hidden="true">{icon}</span><span className="t-stat-label">{label}</span><strong className="t-stat-value">{value}</strong><small className="t-stat-detail">{detail}</small></>
  return onClick ? <button type="button" className="t-card t-stat t-stat-interactive" onClick={onClick}>{body}</button> : <div className="t-card t-stat">{body}</div>
}

/** Empty / zero state with an optional recovery action (Nielsen #9). */
export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="t-empty">{icon && <span className="t-empty-icon" aria-hidden="true">{icon}</span>}<strong>{title}</strong>{description && <p>{description}</p>}{action}</div>
}

/** Inline message banner. `error` announces itself to screen readers. */
export function Alert({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'error'; title?: string; children: React.ReactNode }) {
  const Icon = tone === 'success' ? CircleCheck : tone === 'warning' ? TriangleAlert : tone === 'error' ? CircleAlert : Info
  return <div className={cx('t-alert', `t-alert-${tone}`)} role={tone === 'error' ? 'alert' : undefined}><Icon size={16} aria-hidden="true" /><div>{title && <strong>{title}</strong>}<span>{children}</span></div></div>
}

/** Key/value pair list used for summaries (question, model answer, topic …). */
export function DescriptionList({ items }: { items: Array<{ term: string; detail: React.ReactNode }> }) {
  return <dl className="t-dl">{items.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.detail}</dd></div>)}</dl>
}

/* ------------------------------------------------------------------- inputs */

function FieldShell({ label, hint, required, children, htmlFor }: { label: string; hint?: React.ReactNode; required?: boolean; children: React.ReactNode; htmlFor: string }) {
  return <div className="t-field">
    <label htmlFor={htmlFor}>{label}{required && <span className="t-required" aria-hidden="true"> *</span>}</label>
    {children}
    {hint && <small className="t-hint">{hint}</small>}
  </div>
}

export function TextField({ label, value, onChange, required = false, type = 'text', hint, placeholder, min, max, disabled }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; hint?: React.ReactNode; placeholder?: string; min?: number; max?: number; disabled?: boolean }) {
  const id = useId()
  return <FieldShell label={label} hint={hint} required={required} htmlFor={id}><input id={id} className="t-input" type={type} value={value} required={required} placeholder={placeholder} min={min} max={max} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></FieldShell>
}

export function TextArea({ label, value, onChange, rows = 3, required = false, hint, placeholder, disabled, ariaLabel }: { label?: string; value: string; onChange: (value: string) => void; rows?: number; required?: boolean; hint?: React.ReactNode; placeholder?: string; disabled?: boolean; ariaLabel?: string }) {
  const id = useId()
  const area = <textarea id={id} className="t-input" rows={rows} required={required} value={value} placeholder={placeholder} disabled={disabled} aria-label={label ? undefined : ariaLabel} onChange={(event) => onChange(event.target.value)} />
  return label ? <FieldShell label={label} hint={hint} required={required} htmlFor={id}>{area}</FieldShell> : <div className="t-field">{area}</div>
}

export function SelectField({ label, value, options, onChange, hint, hideLabel = false }: { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void; hint?: React.ReactNode; hideLabel?: boolean }) {
  const id = useId()
  const select = <select id={id} className="t-input t-select" value={value} aria-label={hideLabel ? label : undefined} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => typeof option === 'string' ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
  return hideLabel ? select : <FieldShell label={label} hint={hint} htmlFor={id}>{select}</FieldShell>
}

/** Accessible switch built on a native checkbox. */
export function Toggle({ label, detail, checked, onChange, disabled = false }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className={cx('t-toggle', disabled && 'is-disabled')}>
    <span className="t-toggle-copy"><strong>{label}</strong><small>{detail}</small></span>
    <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    <span className="t-switch" aria-hidden="true" />
  </label>
}

/**
 * Segmented control used for every "pick one view" choice (By student / By
 * question, filters, feedback language). Implemented as pressed buttons.
 */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: React.ReactNode }>; onChange: (value: T) => void }) {
  return <div className="t-segmented" role="group" aria-label={label}>
    {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} className={value === option.value ? 'is-active' : ''} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>
}

/** Horizontal tabs (question tabs). */
export function Tabs<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: React.ReactNode; meta?: React.ReactNode }>; onChange: (value: T) => void }) {
  return <div className="t-tabs" role="tablist" aria-label={label}>
    {options.map((option) => <button type="button" role="tab" key={String(option.value)} aria-selected={value === option.value} className={value === option.value ? 'is-active' : ''} onClick={() => onChange(option.value)}>
      <span>{option.label}</span>{option.meta && <small>{option.meta}</small>}
    </button>)}
  </div>
}

/** Selectable list row used by queues and rosters (papers, students, requests). */
export function ListItem({ title, subtitle, leading, trailing, active = false, onClick }: { title: React.ReactNode; subtitle?: React.ReactNode; leading?: React.ReactNode; trailing?: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const content = <>{leading}<span className="t-list-copy"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{trailing && <span className="t-list-trailing">{trailing}</span>}</>
  return onClick
    ? <button type="button" className={cx('t-list-item', 't-list-item-interactive', active && 'is-active')} aria-current={active ? 'true' : undefined} onClick={onClick}>{content}</button>
    : <div className="t-list-item">{content}</div>
}

/* --------------------------------------------------------------- overlays */

/**
 * Modal dialog: focuses the first control on open, closes on Escape or a
 * backdrop click, and returns focus to the trigger on close (Nielsen #3 —
 * user control and freedom).
 */
export function Modal({ title, description, children, onClose, footer }: { title: string; description?: React.ReactNode; children?: React.ReactNode; onClose: () => void; footer: React.ReactNode }) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()
  // Keep the latest onClose without re-running the mount effect: parents pass
  // inline callbacks, and re-running would steal focus while the user types.
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const focusable = dialogRef.current?.querySelector<HTMLElement>('textarea, input, select, button:not([data-close])')
    focusable?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus() }
  }, [])
  return <div className="t-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} className="t-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="t-modal-header"><h2 id={titleId}>{title}</h2><button type="button" data-close className="t-icon-btn" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></header>
      {description && <p className="t-modal-description">{description}</p>}
      {children}
      <footer className="t-modal-footer">{footer}</footer>
    </section>
  </div>
}

/** Transient confirmation message (Nielsen #1 — visibility of system status). */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="t-toast-region" aria-live="polite">
    {message && <div className="t-toast" role="status"><CircleCheck size={18} aria-hidden="true" /><span>{message}</span><button type="button" aria-label="Dismiss message" onClick={onDismiss}><X size={16} /></button></div>}
  </div>
}
