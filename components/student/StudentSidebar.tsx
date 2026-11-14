'use client'

import {
  ClipboardList,
  HelpCircle,
  Home,
  Settings,
  Sprout,
  Upload,
} from 'lucide-react'

type StudentSidebarProps = {
  currentScreen: string
  onNavigate: (screen: string) => void
  role: 'student' | 'parent'
  translate: (value: string) => string
}

const navigationItems = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'upload', label: 'Upload exam', Icon: Upload },
  { id: 'results', label: 'My results', Icon: ClipboardList },
  { id: 'progress', label: 'My progress', Icon: Sprout },
  { id: 'help', label: 'Ask for help', Icon: HelpCircle },
]

export function StudentSidebar({
  currentScreen,
  onNavigate,
  role,
  translate,
}: StudentSidebarProps) {
  return (
    <aside className="sidebar student-sidebar">
      <div className="view-label">
        {translate(role === 'parent' ? 'Parent view' : 'Student view')}
      </div>
      {navigationItems.map(({ id, label, Icon }) => {
        const isActive = currentScreen === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`side-item side-item-${id} ${isActive ? 'selected' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {translate(label)}
          </button>
        )
      })}
      <div className="sidebar-bottom">
        <button className="side-item side-item-settings" type="button">
          <Settings size={18} aria-hidden="true" />
          {translate('Settings')}
        </button>
        <div className="demo-note">
          Frontend prototype
          <br />
          <span>Mock data only</span>
        </div>
      </div>
    </aside>
  )
}
