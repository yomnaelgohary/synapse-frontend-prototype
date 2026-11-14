'use client'

/**
 * Teacher "sticker" components
 * ----------------------------
 * The student view's sticker language (ink outlines, hard shadows, Fredoka
 * headings, Nunito body), toned down for teachers. Presentation only: every
 * component takes the existing strings, counts and handlers as props.
 *
 * Surface rule (see app/teacher.css, section "sticker"):
 *  - containers (hero, section cards) get a soft 2px border and soft shadow;
 *  - pressable things get the ink border + hard ink shadow.
 * All styles use the `ts-` prefix and the tokens defined on `.tch`.
 */

import type { ComponentType, ReactNode } from 'react'
import { ArrowRight, Check, ChevronRight, ClipboardCheck, Flag, Lock, ScanLine, ShieldCheck, Upload } from 'lucide-react'
import { cx } from './ui'

/* ------------------------------------------------------------------ hero */

export type SynaMascotComponent = ComponentType<{ size?: 'hero' | 'tip'; decorative?: boolean }>

/** Lavender page hero: Syna, eyebrow chip, H1, helper line, controls and an action slot. */
export function PageHero({ eyebrow, eyebrowIcon, title, helper, controls, action, Mascot, tone = 'lavender' }: { eyebrow: string; eyebrowIcon: ReactNode; title: string; helper: string; controls?: ReactNode; action?: ReactNode; Mascot?: SynaMascotComponent; tone?: 'lavender' | 'sun' | 'coral' | 'sky' }) {
  return <section className={cx('ts-hero', `ts-hero-${tone}`)}>
    {/* The mascot is decorative here; it reuses the student view's idle animations. */}
    {Mascot && <div className="ts-hero-mascot"><Mascot size="tip" decorative /></div>}
    <div className="ts-hero-copy">
      <span className="ts-eyebrow"><span aria-hidden="true">{eyebrowIcon}</span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{helper}</p>
      {controls && <div className="ts-hero-controls">{controls}</div>}
    </div>
    {action && <div className="ts-hero-action">{action}</div>}
  </section>
}

/* ---------------------------------------------------------- buttons/links */

/** Sticker button: primary = indigo, secondary = white. `sm` = 44px high. */
export function StickerButton({ children, onClick, variant = 'primary', size = 'md', icon, trailingIcon, disabled = false, ariaLabel, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; size?: 'md' | 'sm'; icon?: ReactNode; trailingIcon?: ReactNode; disabled?: boolean; ariaLabel?: string; type?: 'button' | 'submit' }) {
  return <button type={type} className={cx('ts-btn', `ts-btn-${variant}`, size === 'sm' && 'ts-btn-sm')} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
    {icon && <span className="ts-btn-icon" aria-hidden="true">{icon}</span>}{children}{trailingIcon && <span className="ts-btn-icon ts-btn-trailing" aria-hidden="true">{trailingIcon}</span>}
  </button>
}

/** Tertiary text link with an arrow that nudges on hover. */
export function TextLink({ children, onClick, icon = 'arrow' }: { children: ReactNode; onClick: () => void; icon?: 'arrow' | 'chevron' }) {
  return <button type="button" className="ts-link" onClick={onClick}>{children}<span className="ts-link-icon" aria-hidden="true">{icon === 'arrow' ? <ArrowRight size={18} strokeWidth={2.4} /> : <ChevronRight size={18} strokeWidth={2.4} />}</span></button>
}

/* ------------------------------------------------------------------ chips */

/** Workflow status chip: always icon + text, so colour is never the only signal. */
export function StatusChip({ status }: { status: string }) {
  const variant = status === 'Text verification' ? { tone: 'sun', icon: <ScanLine size={16} strokeWidth={2.4} /> }
    : status === 'Awaiting confirmation' ? { tone: 'lavender', icon: <ClipboardCheck size={16} strokeWidth={2.4} /> }
    : status === 'Released' ? { tone: 'mint', icon: <Check size={16} strokeWidth={2.6} /> }
    : { tone: 'plain', icon: <Upload size={16} strokeWidth={2.4} /> } // e.g. a newly created exam ("Uploaded")
  return <span className={cx('ts-status', `ts-status-${variant.tone}`)}><span aria-hidden="true">{variant.icon}</span>{status}</span>
}

/** Count chip for section headers ("2 pending", "3 new"). */
export function CountChip({ children, tone }: { children: ReactNode; tone: 'amber' | 'sky' }) {
  return <span className={cx('ts-count', `ts-count-${tone}`)}>{children}</span>
}

/** Small meta count ("6 uploaded"); zero values are muted. */
export function MetaPill({ value, label }: { value: number; label: string }) {
  return <span className={cx('ts-meta', value === 0 && 'is-zero')}><strong>{value}</strong> {label}</span>
}

/** White info pill with an icon (hero context). */
export function InfoPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="ts-info"><span aria-hidden="true">{icon}</span>{children}</span>
}

/** Workflow stage of an exam status: 1 Uploaded … 4 Released. */
export const stageOf = (status: string) => status === 'Released' ? 4 : status === 'Awaiting confirmation' ? 3 : status === 'Text verification' ? 2 : 1

/** Small 4-dot stage tracker under a status chip (decorative; the chip carries the text). */
export function StageDots({ status }: { status: string }) {
  const stage = stageOf(status)
  return <span className="ts-dots" aria-hidden="true">{[1, 2, 3, 4].map((step) => <i key={step} className={step <= stage ? 'is-on' : ''} />)}</span>
}

/** Pass / below-pass total: icon + tint + hidden text, never colour alone. */
export function ScorePill({ passed, children }: { passed: boolean; children: ReactNode }) {
  return <span className={cx('ts-score', passed ? 'is-pass' : 'is-below')}>
    {passed ? <Check size={16} strokeWidth={2.8} aria-hidden="true" /> : <Flag size={16} strokeWidth={2.6} aria-hidden="true" />}
    {children}<span className="t-sr-only">{passed ? ' pass' : ' below pass mark'}</span>
  </span>
}

/* -------------------------------------------------------------- stat card */

export type StatTone = 'sky' | 'sun' | 'lavender' | 'mint'

/**
 * Workflow stage card. `attention` = work waiting for the teacher (ink outline,
 * sun tint); a zero value is muted. The whole card is the existing button.
 */
export function StatCard({ step, label, value, detail, icon, tone, attention = false, onClick }: { step: number; label: string; value: number; detail: string; icon: ReactNode; tone: StatTone; attention?: boolean; onClick: () => void }) {
  return <button type="button" className={cx('ts-stat', attention && 'is-attention', value === 0 && 'is-zero')} onClick={onClick}>
    <span className="ts-stat-top">
      <span className={cx('ts-tile', `ts-tile-${tone}`)} aria-hidden="true">{icon}</span>
      <span className="ts-stat-label">{label}</span>
      <span className="ts-stat-step" aria-hidden="true">{step}</span>
    </span>
    <strong className="ts-stat-value">{value}</strong>
    <span className="ts-stat-detail">{detail}</span>
  </button>
}

/* ----------------------------------------------------------- section card */

/** Container card with a header row, divided rows and an optional footer link. */
export function SectionCard({ title, helper, aside, footer, children }: { title: string; helper?: string; aside?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return <section className="ts-section">
    <header className="ts-section-head">
      <div><h2>{title}</h2>{helper && <p>{helper}</p>}</div>
      {aside && <div className="ts-section-aside">{aside}</div>}
    </header>
    <div className="ts-section-body">{children}</div>
    {footer && <footer className="ts-section-foot">{footer}</footer>}
  </section>
}

/** Full-width link row (red flag / help request). */
export function LinkRow({ leading, title, description, onClick }: { leading: ReactNode; title: string; description: string; onClick: () => void }) {
  return <button type="button" className="ts-linkrow" onClick={onClick}>
    {leading}
    <span className="ts-linkrow-copy"><strong>{title}</strong><span>{description}</span></span>
    <ChevronRight className="ts-linkrow-chevron" size={22} strokeWidth={2.4} aria-hidden="true" />
  </button>
}

/* ---------------------------------------------------------------- footer */

/** Trust footer: the two privacy rules plus the prototype line. */
export function TrustFooter() {
  return <footer className="ts-footer">
    <div className="ts-footer-inner">
      <span><ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" /> Only teacher-confirmed results are shared with students.</span>
      <span><Lock size={18} strokeWidth={2.4} aria-hidden="true" /> Private notes and dismissed flags stay visible to teachers only.</span>
      <span className="ts-footer-meta">Synapse · Class 4B · Prototype</span>
    </div>
  </footer>
}
