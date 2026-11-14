'use client'

/**
 * Global teacher header (sticker theme): brand, primary navigation, language,
 * notifications and profile. It is the only header on teacher pages; below
 * 900px the same four sections move to a bottom tab bar.
 *
 * The app navigates with screen state rather than routes, so items are buttons
 * with aria-current="page"; a section stays active on its sub-pages (e.g.
 * "Exams" while verifying text).
 */

import { useEffect, useId, useRef, useState } from 'react'
import { Bell, ChevronRight, ClipboardCheck, FileText, Flag, Inbox, LayoutDashboard, LogOut, ScanLine, Sparkles, Target } from 'lucide-react'
import { cx } from './ui'

export type TeacherScreen = 'dashboard' | 'exams' | 'create' | 'verify' | 'grades' | 'gaps' | 'profile' | 'help'

/** Options the app shell passes in (interface language). */
export type TeacherChrome = {
  language: 'EN' | 'DE'
  onLanguageChange: (language: 'EN' | 'DE') => void
  /** Back to the login screen without reloading, so this session's demo data is kept. */
  onSignOut?: () => void
}

/** One teacher notification (built from live data in the workspace). */
export type TeacherNotification = { id: string; kind: 'help' | 'flag' | 'text' | 'grades'; title: string; message: string; onOpen: () => void }

const notificationIcon = { help: Inbox, flag: Flag, text: ScanLine, grades: ClipboardCheck }
const notificationTile = { help: 'sky', flag: 'coral', text: 'sun', grades: 'lavender' } as const

/**
 * Bell + notification menu: the bell opens the list; each item goes straight to
 * its section. Esc / outside click close it and focus returns to the bell.
 */
function NotificationMenu({ items }: { items: TeacherNotification[] }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  useEffect(() => {
    if (!open) return
    wrapRef.current?.querySelector<HTMLElement>('.ts-notif-item')?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); bellRef.current?.focus() } }
    const onDown = (event: MouseEvent) => { if (!wrapRef.current?.contains(event.target as Node)) setOpen(false) }
    window.addEventListener('keydown', onKey); window.addEventListener('mousedown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown) }
  }, [open])
  return <div className="ts-notif" ref={wrapRef}>
    <button ref={bellRef} type="button" className="ts-round-btn ts-bell" aria-label={`Notifications, ${items.length} new`} title="Notifications" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}>
      <Bell size={22} strokeWidth={2.4} aria-hidden="true" />{items.length > 0 && <b aria-hidden="true">{items.length}</b>}
    </button>
    {open && <div className="ts-notif-menu" id={menuId} role="region" aria-label="Notifications">
      <div className="ts-notif-head"><strong>Notifications</strong><span className="ts-count ts-count-sky">{items.length} new</span></div>
      {items.length ? <ul>{items.map((item) => {
        const Icon = notificationIcon[item.kind]
        return <li key={item.id}><button type="button" className="ts-notif-item" onClick={() => { setOpen(false); item.onOpen() }}>
          <span className={`ts-notif-tile ts-tile-${notificationTile[item.kind]}`} aria-hidden="true"><Icon size={20} strokeWidth={2.4} /></span>
          <span className="ts-notif-copy"><strong>{item.title}</strong><span>{item.message}</span></span>
          <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
        </button></li>
      })}</ul> : <p className="ts-notif-empty">You are all caught up.</p>}
    </div>}
  </div>
}

/** Primary sections, the screens that belong to each, and their fixed tile colour. */
export const teacherSections: Array<{ id: TeacherScreen; label: string; icon: React.ElementType; tile: 'lavender' | 'sun' | 'coral' | 'sky'; screens: TeacherScreen[] }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tile: 'lavender', screens: ['dashboard'] },
  { id: 'exams', label: 'Exams', icon: FileText, tile: 'sun', screens: ['exams', 'create', 'verify', 'grades'] },
  { id: 'gaps', label: 'Learning gaps', icon: Target, tile: 'coral', screens: ['gaps', 'profile'] },
  { id: 'help', label: 'Help requests', icon: Inbox, tile: 'sky', screens: ['help'] },
]

/** One section link; shared by the top nav and the phone tab bar. */
function SectionLink({ section, active, helpCount, onNavigate, variant }: { section: (typeof teacherSections)[number]; active: boolean; helpCount: number; onNavigate: (screen: TeacherScreen) => void; variant: 'nav' | 'tab' }) {
  const Icon = section.icon
  return <button type="button" className={cx(variant === 'nav' ? 'ts-nav-item' : 'ts-tab', active && 'is-active')} aria-current={active ? 'page' : undefined} onClick={() => onNavigate(section.id)}>
    <span className={cx('ts-nav-tile', `ts-tile-${section.tile}`)} aria-hidden="true"><Icon size={variant === 'nav' ? 18 : 20} strokeWidth={2.4} /></span>
    <span className="ts-nav-label">{section.label}</span>
    {section.id === 'help' && helpCount > 0 && <em className="ts-nav-count" aria-label={`${helpCount} new`}>{helpCount}</em>}
  </button>
}

export function TeacherHeader({ screen, onNavigate, helpCount, chrome, notifications = [] }: { screen: string; onNavigate: (screen: TeacherScreen) => void; helpCount: number; chrome?: TeacherChrome; notifications?: TeacherNotification[] }) {
  const isActive = (section: (typeof teacherSections)[number]) => section.screens.includes(screen as TeacherScreen)
  return <>
    <header className="ts-header">
      <button type="button" className="ts-brand" onClick={() => onNavigate('dashboard')} aria-label="synapse home">
        <span className="ts-brand-mark" aria-hidden="true"><Sparkles size={24} strokeWidth={2.4} /></span>
        <span className="ts-brand-word" aria-hidden="true">synapse</span>
      </button>
      <span className="ts-role-chip">Teacher</span>

      <nav className="ts-nav" aria-label="Teacher workspace">
        {teacherSections.map((section) => <SectionLink key={section.id} section={section} active={isActive(section)} helpCount={helpCount} onNavigate={onNavigate} variant="nav" />)}
      </nav>

      <div className="ts-header-tools">
        {/* Same EN | DE control as the student bar; it calls the existing language switch. */}
        {chrome && <div className="ts-lang" role="group" aria-label="Interface language">
          {(['EN', 'DE'] as const).map((code) => <button type="button" key={code} aria-pressed={chrome.language === code} onClick={() => chrome.language !== code && chrome.onLanguageChange(code)}>{code}</button>)}
        </div>}
        <NotificationMenu items={notifications} />
        <span className="ts-profile"><span className="ts-avatar" aria-hidden="true">N</span><span className="ts-profile-name">Ms. Nadine</span></span>
        {chrome?.onSignOut && <button type="button" className="ts-round-btn" onClick={chrome.onSignOut} aria-label="Sign out" title="Sign out"><LogOut size={20} strokeWidth={2.4} aria-hidden="true" /></button>}
      </div>
    </header>

    {/* Phone tab bar: the same four sections, shown below 900px. */}
    <nav className="ts-tabbar" aria-label="Teacher workspace sections">
      {teacherSections.map((section) => <SectionLink key={section.id} section={section} active={isActive(section)} helpCount={helpCount} onNavigate={onNavigate} variant="tab" />)}
    </nav>
  </>
}
