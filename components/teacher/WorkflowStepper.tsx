/**
 * StepBar: the assessment workflow Uploaded → Text verification →
 * Grade confirmation → Released. Done = mint check, current = sun number with
 * a pulse ring (aria-current="step"), next = white with a dashed ring. Every
 * step has a plain-text status, so colour is never the only signal.
 */

import { Check } from 'lucide-react'
import { cx } from './ui'

export const workflowSteps = ['Uploaded', 'Text verification', 'Grade confirmation', 'Released'] as const

/**
 * `current` is the index of the active step (omit it for a neutral overview);
 * `allDone` ticks all four steps. `onStep` makes listed steps clickable so the
 * teacher can move between workflow pages (e.g. back to text verification).
 */
export function WorkflowStepper({ current, compact = false, onStep, allDone = false }: { current?: number; compact?: boolean; onStep?: Partial<Record<number, () => void>>; allDone?: boolean }) {
  return <ol className={cx('t-stepper', compact && 't-stepper-compact')} aria-label="Assessment workflow">
    {workflowSteps.map((step, index) => {
      const state = allDone ? 'done' : current === undefined ? 'idle' : index < current ? 'done' : index === current ? 'current' : 'todo'
      const status = state === 'done' ? 'Done' : state === 'current' ? 'Now' : state === 'todo' ? 'Next' : ''
      const body = <>
        <span className="t-stepper-dot" aria-hidden="true">{state === 'done' ? <Check size={20} strokeWidth={3} /> : index + 1}</span>
        <span className="t-stepper-text"><span className="t-stepper-label">{step}</span>{status && <span className="t-stepper-status">{status}</span>}</span>
      </>
      return <li key={step} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
        {onStep?.[index] && state !== 'current' ? <button type="button" className="t-stepper-link" onClick={onStep[index]}>{body}</button> : body}
      </li>
    })}
  </ol>
}
