'use client'

/**
 * Layout frame for every teacher page: header, centred content container,
 * trust footer (same width as the content), toast region and phone tab bar.
 * Screens only render their own content.
 */

import { useEffect } from 'react'
import { Fredoka, Inter, Nunito } from 'next/font/google'
import { TeacherFooter } from './TeacherFooter'
import { TeacherHeader, type TeacherChrome, type TeacherScreen } from './TeacherHeader'
import { Toast } from './ui'

const inter = Inter({ subsets: ['latin'], variable: '--font-teacher', display: 'swap' })
// Same families and weights as the student view's sticker theme.
const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fredoka', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-nunito', display: 'swap' })

export function TeacherShell({ screen, onNavigate, helpCount, chrome, toast, onDismissToast, children }: {
  screen: string
  onNavigate: (screen: TeacherScreen) => void
  helpCount: number
  chrome?: TeacherChrome
  toast: string
  onDismissToast: () => void
  children: React.ReactNode
}) {
  // Each screen starts at the top, like a real page navigation.
  useEffect(() => { window.scrollTo({ top: 0 }) }, [screen])
  return <div className={`tch ${inter.variable} ${fredoka.variable} ${nunito.variable}`} lang="en">
    <a className="t-skip" href="#teacher-main">Skip to content</a>
    <TeacherHeader screen={screen} onNavigate={onNavigate} helpCount={helpCount} chrome={chrome} />
    <div className="ts-container">
      {/* key resets scroll/focus context when the screen changes */}
      <main id="teacher-main" className="t-main" key={screen} tabIndex={-1}>{children}</main>
      <TeacherFooter />
    </div>
    <Toast message={toast} onDismiss={onDismissToast} />
  </div>
}
