/**
 * Assessment workflow stepper: Uploaded → Text verification →
 * Grade confirmation → Released. Shown on the dashboard and on each review
 * step so the teacher always sees where an exam is in the process.
 */

import { Check } from 'lucide-react'
import { cx } from './ui'

export const workflowSteps = ['Uploaded', 'Text verification', 'Grade confirmation', 'Released'] as const

/** `current` is the index of the active step; omit it for a neutral overview. */
export function WorkflowStepper({ current, compact = false }: { current?: number; compact?: boolean }) {
  return <ol className={cx('t-stepper', compact && 't-stepper-compact')} aria-label="Assessment workflow">
    {workflowSteps.map((step, index) => {
      const state = current === undefined ? 'idle' : index < current ? 'done' : index === current ? 'current' : 'todo'
      return <li key={step} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
        <span className="t-stepper-dot" aria-hidden="true">{state === 'done' ? <Check size={12} /> : index + 1}</span>
        <span className="t-stepper-label">{step}</span>
      </li>
    })}
  </ol>
}
