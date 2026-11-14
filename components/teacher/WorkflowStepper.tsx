/**
 * Assessment workflow stepper: Uploaded → Text verification →
 * Grade confirmation → Released. Shown on the dashboard and on each review
 * step so the teacher always sees where an exam is in the process.
 */

import { Check } from 'lucide-react'
import { cx } from './ui'

export const workflowSteps = ['Uploaded', 'Text verification', 'Grade confirmation', 'Released'] as const

/**
 * `current` is the index of the active step; omit it for a neutral overview.
 * `onStep` makes the listed steps clickable, so the teacher can move back and
 * forth between workflow pages (e.g. back to text verification).
 */
export function WorkflowStepper({ current, compact = false, onStep }: { current?: number; compact?: boolean; onStep?: Partial<Record<number, () => void>> }) {
  return <ol className={cx('t-stepper', compact && 't-stepper-compact')} aria-label="Assessment workflow">
    {workflowSteps.map((step, index) => {
      const state = current === undefined ? 'idle' : index < current ? 'done' : index === current ? 'current' : 'todo'
      return <li key={step} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
        {onStep?.[index] && state !== 'current'
          ? <button type="button" className="t-stepper-link" onClick={onStep[index]}><span className="t-stepper-dot" aria-hidden="true">{state === 'done' ? <Check size={12} /> : index + 1}</span><span className="t-stepper-label">{step}</span></button>
          : <><span className="t-stepper-dot" aria-hidden="true">{state === 'done' ? <Check size={12} /> : index + 1}</span><span className="t-stepper-label">{step}</span></>}
      </li>
    })}
  </ol>
}
