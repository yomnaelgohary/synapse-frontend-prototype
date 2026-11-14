'use client'

/**
 * Action feedback for the teacher view ("every action answers back").
 *
 *  - notify(): toast for reversible / instant actions (optional title, tone and Undo).
 *  - confirm(): ConfirmDialog for actions that are irreversible or affect students.
 *    It shows what changes, locks while the action runs (loading verb), closes on
 *    success and shows an error banner with Retry if the action throws.
 *  - Banner: inline ok / warn / err message.
 *
 * Handlers are wrapped, never rewritten: confirm({ onConfirm: existingHandler }).
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, RotateCcw, Sparkles, TriangleAlert, X } from 'lucide-react'
import { Button, Modal, cx } from './ui'

/* ----------------------------------------------------------------- banner */

export type BannerTone = 'ok' | 'warn' | 'err' | 'info'

export function Banner({ tone, title, children, action }: { tone: BannerTone; title: string; children?: ReactNode; action?: ReactNode }) {
  const Icon = tone === 'ok' ? CircleCheck : tone === 'warn' ? TriangleAlert : tone === 'err' ? CircleAlert : Sparkles
  return <div className={cx('t-banner', `t-banner-${tone}`)} role={tone === 'err' ? 'alert' : 'status'}>
    <span className="t-banner-icon" aria-hidden="true"><Icon size={22} strokeWidth={2.4} /></span>
    <div className="t-banner-copy"><strong>{title}</strong>{children && <span>{children}</span>}</div>
    {action && <div className="t-banner-action">{action}</div>}
  </div>
}

/* ------------------------------------------------------------------ types */

export type FeedbackTone = 'success' | 'info' | 'error'
export type ToastInput = { message: string; title?: string; tone?: FeedbackTone; undo?: () => void }

export type ConfirmOptions = {
  title: string
  description: ReactNode
  icon: ReactNode
  /** Tile colour of the dialog icon. */
  tone?: 'sun' | 'lavender' | 'coral' | 'mint' | 'sky'
  /** Summary rows ("Students notified · 6"). */
  rows?: Array<{ label: string; value: ReactNode }>
  /** Warning banner inside the dialog. */
  warning?: { title: string; text?: string }
  /** When set, the action is not allowed right now: the message replaces the primary button. */
  blocked?: string
  confirmLabel: string
  confirmIcon?: ReactNode
  /** Progressive verb shown while the action runs, e.g. "Releasing..." */
  busyLabel?: string
  danger?: boolean
  /** Minimum time the loading state is shown (ms) so slow actions read as in progress. */
  minBusyMs?: number
  onConfirm: () => void | Promise<void>
}

type FeedbackApi = { notify: (input: string | ToastInput) => void; confirm: (options: ConfirmOptions) => void }

const FeedbackContext = createContext<FeedbackApi | null>(null)

/** Shared hook every teacher action uses to answer back. */
export function useActionFeedback(): FeedbackApi {
  const api = useContext(FeedbackContext)
  if (!api) throw new Error('useActionFeedback must be used inside ActionFeedbackProvider')
  return api
}

/* --------------------------------------------------------------- provider */

export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(null)
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const notify = useCallback((input: string | ToastInput) => setToast({ ...(typeof input === 'string' ? { message: input } : input), id: Date.now() }), [])
  const confirm = useCallback((options: ConfirmOptions) => { setFailed(false); setDialog(options) }, [])

  const run = async () => {
    if (!dialog || busy) return
    setBusy(true); setFailed(false)
    try {
      // Show the loading state first, then run the existing handler.
      if (dialog.minBusyMs) await new Promise((resolve) => window.setTimeout(resolve, dialog.minBusyMs))
      await dialog.onConfirm()
      setDialog(null)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return <FeedbackContext.Provider value={{ notify, confirm }}>
    {children}
    {dialog && <Modal
      title={dialog.title}
      description={dialog.description}
      icon={dialog.icon}
      tone={dialog.tone}
      busy={busy}
      onClose={() => setDialog(null)}
      footer={<>
        <Button variant="secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</Button>
        {!dialog.blocked && <Button variant={dialog.danger ? 'danger' : 'primary'} icon={dialog.confirmIcon} state={busy ? 'loading' : undefined} busyLabel={dialog.busyLabel} onClick={run}>{dialog.confirmLabel}</Button>}
      </>}>
      {dialog.rows && <dl className="t-confirm-rows">{dialog.rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}
      {dialog.warning && <Banner tone="warn" title={dialog.warning.title}>{dialog.warning.text}</Banner>}
      {dialog.blocked && <Banner tone="warn" title={dialog.blocked} />}
      {failed && <Banner tone="err" title="Something went wrong" action={<Button variant="secondary" size="sm" icon={<RotateCcw size={16} />} onClick={run}>Retry</Button>}>Nothing was changed or sent. Try again.</Banner>}
    </Modal>}
    <ToastView toast={toast} onDismiss={() => setToast(null)} />
  </FeedbackContext.Provider>
}

/* ------------------------------------------------------------------ toast */

/** Bottom-right toast: auto-dismisses after about 5s, pauses on hover/focus. */
function ToastView({ toast, onDismiss }: { toast: (ToastInput & { id: number }) | null; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(5000)
  const startedAt = useRef(0)
  // Latest onDismiss without restarting the timer on every parent render.
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss
  useEffect(() => { remaining.current = 5000 }, [toast?.id])
  useEffect(() => {
    if (!toast || paused) return
    startedAt.current = Date.now()
    const timer = window.setTimeout(() => dismissRef.current(), remaining.current)
    return () => { window.clearTimeout(timer); remaining.current -= Date.now() - startedAt.current }
  }, [toast, paused])
  const tone = toast?.tone ?? 'success'
  const Icon = tone === 'error' ? CircleAlert : tone === 'info' ? Sparkles : CircleCheck
  return <div className="t-toast-region" aria-live="polite">
    {toast && <div key={toast.id} className={cx('t-toast', `t-toast-${tone}`)} role="status" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <span className="t-toast-icon" aria-hidden="true"><Icon size={22} strokeWidth={2.4} /></span>
      <span className="t-toast-copy">{toast.title && <strong>{toast.title}</strong>}<span>{toast.message}</span></span>
      {toast.undo && <button type="button" className="t-toast-undo" onClick={() => { toast.undo?.(); onDismiss() }}><RotateCcw size={16} aria-hidden="true" />Undo</button>}
      <button type="button" className="t-toast-close" aria-label="Dismiss message" onClick={onDismiss}><X size={18} /></button>
    </div>}
  </div>
}
