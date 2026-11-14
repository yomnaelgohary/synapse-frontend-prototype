/**
 * Global teacher footer. Restates the two trust rules of the workflow on every
 * page so they never have to be remembered (Nielsen #6 — recognition rather
 * than recall).
 */

import { Lock, ShieldCheck } from 'lucide-react'

export function TeacherFooter() {
  return <footer className="t-footer">
    <div className="t-footer-inner">
      <span><ShieldCheck size={14} aria-hidden="true" /> Only teacher-confirmed results are shared with students.</span>
      <span><Lock size={14} aria-hidden="true" /> Private notes and dismissed flags stay visible to teachers only.</span>
      <span className="t-footer-meta">Synapse · Class 4B · Prototype</span>
    </div>
  </footer>
}
