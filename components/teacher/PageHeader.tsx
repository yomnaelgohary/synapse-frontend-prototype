/**
 * Page header shared by every teacher screen: breadcrumb trail (where am I,
 * how do I get back), title, one-line context, and the page's actions.
 * Primary action is always right-most so it is found in the same place.
 */

import { ChevronRight } from 'lucide-react'

export type Crumb = { label: string; onClick?: () => void }

export function PageHeader({ crumbs = [], title, description, actions, children }: { crumbs?: Crumb[]; title: string; description?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode }) {
  return <div className="t-page-header">
    {crumbs.length > 0 && <nav className="t-breadcrumbs" aria-label="Breadcrumb"><ol>
      {crumbs.map((crumb, index) => <li key={crumb.label}>
        {crumb.onClick ? <button type="button" onClick={crumb.onClick}>{crumb.label}</button> : <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>}
        {index < crumbs.length - 1 && <ChevronRight size={13} aria-hidden="true" />}
      </li>)}
    </ol></nav>}
    <div className="t-page-title-row">
      <div className="t-page-title"><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {actions && <div className="t-page-actions">{actions}</div>}
    </div>
    {children}
  </div>
}
