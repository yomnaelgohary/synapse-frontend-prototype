'use client'

/**
 * Layout frame for every teacher page: header, centred content container,
 * trust footer (same width as the content) and phone tab bar. Toasts and
 * dialogs come from the ActionFeedbackProvider (feedback.tsx).
 * Screens only render their own content.
 */

import { useEffect, useRef } from 'react'
import { Fredoka, Inter, Nunito } from 'next/font/google'
import { TeacherFooter } from './TeacherFooter'
import { TeacherHeader, type TeacherChrome, type TeacherNotification, type TeacherScreen } from './TeacherHeader'
import { ActionFeedbackProvider } from './feedback'
import { useTeacherTranslation } from './i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-teacher', display: 'swap' })
// Same families and weights as the student view's sticker theme.
const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fredoka', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-nunito', display: 'swap' })

export function TeacherShell({ screen, onNavigate, helpCount, chrome, notifications, children }: {
  screen: string
  onNavigate: (screen: TeacherScreen) => void
  helpCount: number
  chrome?: TeacherChrome
  notifications?: TeacherNotification[]
  children: React.ReactNode
}) {
  // Each screen starts at the top, like a real page navigation.
  useEffect(() => { window.scrollTo({ top: 0 }) }, [screen])
  // Whole teacher interface follows the EN | DE switch, at any time.
  const rootRef = useRef<HTMLDivElement>(null)
  const language = chrome?.language ?? 'EN'
  useTeacherTranslation(rootRef, language)
  return <div ref={rootRef} className={`tch ${inter.variable} ${fredoka.variable} ${nunito.variable}`} lang={language === 'DE' ? 'de' : 'en'}>
    {/* Provider sits inside .tch (so toasts/dialogs get the theme) and outside the keyed main (so a toast survives navigation). */}
    <ActionFeedbackProvider>
      <a className="t-skip" href="#teacher-main">Skip to content</a>
      <TeacherHeader screen={screen} onNavigate={onNavigate} helpCount={helpCount} chrome={chrome} notifications={notifications} />
      <div className="ts-container">
        {/* key resets scroll/focus context when the screen changes */}
        <main id="teacher-main" className="t-main" key={screen} tabIndex={-1}>{children}</main>
        <TeacherFooter />
      </div>
    </ActionFeedbackProvider>
  </div>
}
