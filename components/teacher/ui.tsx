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

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CircleAlert, CircleCheck, Clock3, Flag, Info, Loader2, TriangleAlert, X } from 'lucide-react'

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

/**
 * Sticker button. `state="loading"` shows a spinner + progressive verb and
 * cannot be pressed twice; `state="done"` is a finished, non-clickable state
 * (a completed action never leaves the same active button).
 */
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', icon, ariaLabel, block = false, state, busyLabel, trailingIcon }: {
  children?: React.ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  icon?: React.ReactNode
  ariaLabel?: string
  block?: boolean
  state?: 'loading' | 'done'
  busyLabel?: string
  trailingIcon?: React.ReactNode
}) {
  const loading = state === 'loading'
  const done = state === 'done'
  return <button type={type} className={cx('t-btn', done ? 't-btn-done' : `t-btn-${variant}`, size === 'sm' && 't-btn-sm', block && 't-btn-block', !children && 't-btn-icon', loading && 'is-loading')} onClick={loading || done ? undefined : onClick} disabled={disabled || loading || done} aria-disabled={done || undefined} aria-busy={loading || undefined} aria-label={ariaLabel} title={!children ? ariaLabel : undefined}>
    {loading ? <Loader2 className="t-spin" size={18} aria-hidden="true" /> : done ? <Check size={18} strokeWidth={2.6} aria-hidden="true" /> : icon}
    {loading && busyLabel ? busyLabel : children}
    {!loading && !done && trailingIcon && <span className="t-btn-trailing" aria-hidden="true">{trailingIcon}</span>}
  </button>
}

/** Text-style link button used for secondary navigation ("View all →"). */
export function LinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className="t-link" onClick={onClick}>{children}</button>
}

/* ----------------------------------------------------------------- display */

/** Default status icon per tone, so colour is never the only signal. */
const toneIcon: Partial<Record<Tone, React.ReactNode>> = {
  success: <Check size={15} strokeWidth={2.8} />,
  warning: <Clock3 size={15} strokeWidth={2.6} />,
  danger: <Flag size={15} strokeWidth={2.6} />,
}

/** Status/count chip. Success, warning and danger chips always carry an icon; `icon` overrides it, `icon={false}` removes it. */
export function Badge({ children, tone = 'neutral', dot = false, icon }: { children: React.ReactNode; tone?: Tone; dot?: boolean; icon?: React.ReactNode | false }) {
  const shown = icon === false ? null : icon ?? toneIcon[tone] ?? (dot ? <i /> : null)
  return <span className={cx('t-badge', `t-badge-${tone}`)}>{shown && <span className="t-badge-icon" aria-hidden="true">{shown}</span>}{children}</span>
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

/**
 * Shared props for every input. `error` turns the field red, shows the
 * message under it and links it to the control for screen readers;
 * `id` lets a form move focus to the field from an error summary.
 */
type FieldProps = { label: string; hint?: React.ReactNode; error?: string; required?: boolean; id?: string; onBlur?: () => void }

/** aria-describedby value for the hint and/or error under a field. */
const describedBy = (id: string, hint?: React.ReactNode, error?: string) => [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

function FieldShell({ label, hint, error, required, children, htmlFor }: { label: string; hint?: React.ReactNode; error?: string; required?: boolean; children: React.ReactNode; htmlFor: string }) {
  return <div className={cx('t-field', error && 'has-error')}>
    <label htmlFor={htmlFor}>{label}{required && <span className="t-required" aria-hidden="true"> *</span>}</label>
    {children}
    {error && <small className="t-error" id={`${htmlFor}-error`}><CircleAlert size={13} aria-hidden="true" />{error}</small>}
    {hint && <small className="t-hint" id={`${htmlFor}-hint`}>{hint}</small>}
  </div>
}

export function TextField({ label, value, onChange, required = false, type = 'text', hint, error, placeholder, min, max, step, disabled, id: fixedId, onBlur }: FieldProps & { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; min?: number; max?: number; step?: number; disabled?: boolean }) {
  const autoId = useId(); const id = fixedId ?? autoId
  return <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={id}>
    <input id={id} className="t-input" type={type} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} placeholder={placeholder} min={min} max={max} step={step} disabled={disabled} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
  </FieldShell>
}

export function TextArea({ label, value, onChange, rows = 3, required = false, hint, error, placeholder, disabled, ariaLabel, id: fixedId, onBlur }: Omit<FieldProps, 'label'> & { label?: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string; disabled?: boolean; ariaLabel?: string }) {
  const autoId = useId(); const id = fixedId ?? autoId
  const area = <textarea id={id} className="t-input" rows={rows} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={label ? describedBy(id, hint, error) : undefined} value={value} placeholder={placeholder} disabled={disabled} aria-label={label ? undefined : ariaLabel} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
  return label ? <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={id}>{area}</FieldShell> : <div className="t-field">{area}</div>
}

export function SelectField({ label, value, options, onChange, hint, error, required = false, hideLabel = false, id: fixedId, onBlur }: FieldProps & { value: string; options: Array<string | { value: string; label: string }>; onChange: (value: string) => void; hideLabel?: boolean }) {
  const autoId = useId(); const id = fixedId ?? autoId
  const select = <select id={id} className="t-input t-select" value={value} aria-label={hideLabel ? label : undefined} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={hideLabel ? undefined : describedBy(id, hint, error)} onBlur={onBlur} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => typeof option === 'string' ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
  return hideLabel ? select : <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={id}>{select}</FieldShell>
}

/**
 * Error summary shown at the top of a form after a failed save. Each item is
 * a button that moves focus to the field, so nothing has to be hunted for
 * (Nielsen #9 — help users recognise, diagnose, and recover from errors).
 */
export function ErrorSummary({ title, errors, summaryRef }: { title: string; errors: Array<{ fieldId: string; label: string; message: string }>; summaryRef?: React.Ref<HTMLDivElement> }) {
  const focusField = (fieldId: string) => {
    const field = document.getElementById(fieldId)
    field?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    field?.focus({ preventScroll: true })
  }
  return <div className="t-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
    <strong><CircleAlert size={16} aria-hidden="true" />{title}</strong>
    <ul>{errors.map((item) => <li key={`${item.fieldId}-${item.message}`}><button type="button" onClick={() => focusField(item.fieldId)}><span>{item.label}:</span> {item.message}</button></li>)}</ul>
  </div>
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
export function Tabs<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: React.ReactNode; meta?: React.ReactNode; progress?: number; state?: 'done' | 'todo' }>; onChange: (value: T) => void }) {
  return <div className="t-tabs" role="tablist" aria-label={label}>
    {options.map((option) => <button type="button" role="tab" key={String(option.value)} aria-selected={value === option.value} className={cx(value === option.value && 'is-active', option.progress !== undefined && 't-tab-card')} onClick={() => onChange(option.value)}>
      <span className="t-tab-title">{option.state && <span className={`t-tab-state is-${option.state}`} aria-hidden="true">{option.state === 'done' ? <Check size={15} strokeWidth={2.8} /> : <Clock3 size={15} strokeWidth={2.6} />}</span>}{option.label}{option.state && <span className="t-sr-only"> · {option.state === 'done' ? 'done' : 'to check'}</span>}</span>
      {option.meta && <small>{option.meta}{option.progress !== undefined && <b>{Math.round(option.progress)}%</b>}</small>}
      {option.progress !== undefined && <span className="t-tab-progress" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, option.progress))}%` }} /></span>}
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
 * Modal / confirm dialog. Rendered into the teacher root so the page behind
 * can be made inert; focus moves into the dialog (Cancel or the first field),
 * Tab is trapped, Escape / X / backdrop close it (not while `busy`), and focus
 * returns to the opener on close.
 */
export function Modal({ title, description, children, onClose, footer, icon, tone = 'lavender', busy = false }: { title: string; description?: React.ReactNode; children?: React.ReactNode; onClose: () => void; footer: React.ReactNode; icon?: React.ReactNode; tone?: 'sun' | 'lavender' | 'coral' | 'mint' | 'sky'; busy?: boolean }) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [host, setHost] = useState<HTMLElement | null>(null)
  // Keep the latest onClose/busy without re-running the mount effect: parents pass
  // inline callbacks, and re-running would steal focus while the user types.
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const busyRef = useRef(busy)
  busyRef.current = busy
  // The opener is recorded before the page goes inert (inert blurs it).
  const openerRef = useRef<HTMLElement | null>(null)
  const requestClose = () => { if (!busyRef.current) closeRef.current() }

  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null
    const root = document.querySelector<HTMLElement>('.tch') ?? document.body
    const el = document.createElement('div')
    el.className = 't-modal-host'
    root.appendChild(el)
    // Everything else in the teacher view becomes inert while the dialog is open.
    const others = [...root.children].filter((child) => child !== el) as HTMLElement[]
    others.forEach((child) => child.setAttribute('inert', ''))
    setHost(el)
    return () => { others.forEach((child) => child.removeAttribute('inert')); el.remove() }
  }, [])

  useEffect(() => {
    if (!host) return
    const previous = openerRef.current
    const focusable = dialogRef.current?.querySelector<HTMLElement>('textarea, input, select, .t-modal-footer button, button:not([data-close])')
    focusable?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { requestClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href]')]
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; window.setTimeout(() => previous?.focus(), 0) }
  }, [host]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!host) return null
  return createPortal(<div className="t-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}>
    <section ref={dialogRef} className="t-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} aria-busy={busy || undefined}>
      <header className="t-modal-header">
        {icon && <span className={cx('t-modal-icon', `ts-tile-${tone}`)} aria-hidden="true">{icon}</span>}
        <div className="t-modal-heading"><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId} className="t-modal-description">{description}</p>}</div>
        <button type="button" data-close className="t-modal-close" aria-label="Close" disabled={busy} onClick={requestClose}><X size={20} strokeWidth={2.6} /></button>
      </header>
      {children && <div className="t-modal-body">{children}</div>}
      <footer className="t-modal-footer">{footer}</footer>
    </section>
  </div>, host)
}

/** Transient confirmation message (Nielsen #1 — visibility of system status). */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="t-toast-region" aria-live="polite">
    {message && <div className="t-toast" role="status"><CircleCheck size={18} aria-hidden="true" /><span>{message}</span><button type="button" aria-label="Dismiss message" onClick={onDismiss}><X size={16} /></button></div>}
  </div>
}
