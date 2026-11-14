'use client'

/**
 * Global teacher header: brand, primary navigation, and account utilities.
 * Navigation lives in one place for every teacher screen, and the active
 * section stays highlighted on sub-pages (e.g. "Exams" while verifying text),
 * so teachers always know where they are (Nielsen #1, #6).
 */

import { Bell, ClipboardList, Inbox, Languages, LayoutDashboard, Sparkles, Target } from 'lucide-react'
import { cx } from './ui'

export type TeacherScreen = 'dashboard' | 'exams' | 'create' | 'verify' | 'grades' | 'gaps' | 'profile' | 'help'

/** Options the app shell passes in (role switcher, interface language). */
export type TeacherChrome = {
  role: 'student' | 'teacher' | 'parent'
  onRoleChange: (role: 'student' | 'teacher' | 'parent') => void
  language: 'EN' | 'DE'
  onLanguageChange: (language: 'EN' | 'DE') => void
  translate?: (text: string) => string
}

/** Primary sections and the screens that belong to each one. */
export const teacherSections: Array<{ id: TeacherScreen; label: string; icon: React.ElementType; screens: TeacherScreen[] }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, screens: ['dashboard'] },
  { id: 'exams', label: 'Exams', icon: ClipboardList, screens: ['exams', 'create', 'verify', 'grades'] },
  { id: 'gaps', label: 'Learning gaps', icon: Target, screens: ['gaps', 'profile'] },
  { id: 'help', label: 'Help requests', icon: Inbox, screens: ['help'] },
]

export function TeacherHeader({ screen, onNavigate, helpCount, chrome }: { screen: string; onNavigate: (screen: TeacherScreen) => void; helpCount: number; chrome?: TeacherChrome }) {
  const t = chrome?.translate ?? ((text: string) => text)
  return <header className="t-header">
    <div className="t-header-inner">
      <button type="button" className="t-brand" onClick={() => onNavigate('dashboard')} aria-label="Synapse, go to dashboard">
        <span className="t-brand-mark" aria-hidden="true"><Sparkles size={15} /></span>
        <span>synapse</span>
        <span className="t-brand-tag">Teacher</span>
      </button>

      <nav className="t-nav" aria-label="Teacher workspace">
        {teacherSections.map((section) => {
          const active = section.screens.includes(screen as TeacherScreen)
          const Icon = section.icon
          return <button type="button" key={section.id} className={cx('t-nav-item', active && 'is-active')} aria-current={active ? 'page' : undefined} onClick={() => onNavigate(section.id)}>
            <Icon size={16} aria-hidden="true" /><span>{section.label}</span>
            {section.id === 'help' && helpCount > 0 && <em aria-label={`${helpCount} new`}>{helpCount}</em>}
          </button>
        })}
      </nav>

      <div className="t-header-tools">
        {chrome && <div className="t-role-switch" role="group" aria-label="Prototype view">
          {(['student', 'teacher', 'parent'] as const).map((role) => <button type="button" key={role} aria-pressed={chrome.role === role} className={chrome.role === role ? 'is-active' : ''} onClick={() => chrome.onRoleChange(role)}>{t(role[0].toUpperCase() + role.slice(1))}</button>)}
        </div>}
        {chrome && <button type="button" className="t-icon-btn t-lang" onClick={() => chrome.onLanguageChange(chrome.language === 'EN' ? 'DE' : 'EN')} aria-label={`Interface language: ${chrome.language}. Switch to ${chrome.language === 'EN' ? 'DE' : 'EN'}`}>
          <Languages size={16} aria-hidden="true" />{chrome.language}
        </button>}
        <button type="button" className="t-icon-btn t-bell" onClick={() => onNavigate('help')} aria-label={`Notifications, ${helpCount} new help requests`}>
          <Bell size={18} aria-hidden="true" />{helpCount > 0 && <b aria-hidden="true">{helpCount}</b>}
        </button>
        <span className="t-user"><span className="t-avatar t-avatar-sm" aria-hidden="true">N</span><span className="t-user-name">Ms. Nadine</span></span>
      </div>
    </div>
  </header>
}
