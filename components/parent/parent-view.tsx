'use client'

/**
 * Parent view (sticker design, parent theme). Scope is limited to:
 *  FR 70  confirmed grades and teacher feedback, read-only
 *  FR 71  skill progress + ONLY the red flags the teacher confirmed, in parent wording
 *  FR 72  notifications: new grade released, red flag confirmed
 *  FR 73  upload exam pages for the child; the child still gives the Sure-Check ratings
 * Nothing here edits teacher data: the view only reads the demo workflow saved by
 * the teacher workspace (localStorage) and falls back to the same samples the
 * student view uses. Teacher-only data (notes, pending/dismissed flags, AI
 * suggestions, Sure-Check ratings) is never read into the page.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { AlertCircle, ArrowRight, Bell, CheckCircle2, ClipboardList, Divide, FileUp, Flag, Heart, Hourglass, Info, Lock, MessageCircle, RotateCcw, Sprout, Star, Upload, X } from 'lucide-react'
import { SynaArt } from '@/components/login-syna'
import { StudentUploadFlow } from '@/components/student-upload-flow'

type Language = 'en' | 'de'
export type ParentScreen = 'home' | 'progress' | 'upload'

const CHILD = 'Malak'
const STORAGE_KEY = 'synapse-teacher-workflow-v1'

/* -------------------------------------------------------------- copy */

const copy = {
  en: {
    parentView: 'Parent view', learning: "Malak's learning", readOnly: 'Read-only view · Class 4B',
    newGrade: 'New grade', released: 'Math Quiz 2 was released', releasedText: 'Malak received', releasedText2: 'Ms. Nadine added encouraging feedback.', readResults: 'Read results',
    confirmedGrades: 'Confirmed grades', confirmed: 'Grade confirmed', checking: 'Being checked', checkingText: "Ms. Nadine is still checking this exam. The grade and feedback appear here once they are released.",
    readOnlyChip: 'Read-only', teacherNote: 'A note from Ms. Nadine', teacherNoteText: 'Great effort! You are getting better at finding equivalent fractions.',
    answerFeedback: 'Feedback on answers', question: 'Question', childAnswer: "Malak's answer", noFeedback: 'No written feedback for this exam.',
    progressEyebrow: 'Progress', progressTitle: 'How Malak is learning', progressText: 'Skills across Math exams',
    states: { Secure: 'Doing well', Wobbly: 'Still practising', 'Known gap': 'Needs practice', 'Surprise mistake': 'Unexpected slip' } as Record<string, string>,
    improved: 'Malak moved up to Doing well!',
    support: 'Teacher support', supportText: 'Only support needs that Ms. Nadine has confirmed are shown here.', noSupport: 'No support needs right now. Ms. Nadine will let you know if something needs extra practice.', seeGrades: 'See grades and feedback',
    uploadEyebrow: 'Upload exam pages', uploadTitle: "Send Malak's exam pages", uploadText: 'Choose the exam, add the pages and send them to the teacher.', uploadChip: 'Uploading for Malak. Malak still answers Sure-Check.',
    addTitle: 'Add this page?', addText: (file: string, n: number) => `${file} will be added as page ${n}.`, addConfirm: 'Add page', adding: 'Adding...', added: (n: number) => `Page ${n} added.`,
    sendTitle: 'Send these pages to Ms. Nadine?', sendText: 'The teacher gets the pages right away. Malak gives the Sure-Check ratings afterwards.', sendConfirm: 'Send pages', sending: 'Sending...', sent: 'Pages sent. Ms. Nadine can now check the exam.',
    exam: 'Exam', pages: 'Pages', cancel: 'Cancel', close: 'Close', retry: 'Retry', failed: 'That did not work. Check your connection and try again.', dismiss: 'Dismiss message',
    notifGrade: 'New grade released', notifGradeText: 'Math Quiz 2: 8 / 10 with teacher feedback.', notifFlag: 'Teacher confirmed a support need', notifFlagText: (skill: string) => `${skill}: see how to help at home.`,
    loading: 'Loading',
  },
  de: {
    parentView: 'Elternansicht', learning: 'Malaks Lernen', readOnly: 'Nur Ansicht · Klasse 4B',
    newGrade: 'Neue Note', released: 'Mathetest 2 wurde freigegeben', releasedText: 'Malak hat', releasedText2: 'Frau Nadine hat eine ermutigende Rückmeldung geschrieben.', readResults: 'Ergebnisse lesen',
    confirmedGrades: 'Bestätigte Noten', confirmed: 'Note bestätigt', checking: 'Wird geprüft', checkingText: 'Frau Nadine prüft diese Prüfung noch. Note und Rückmeldung erscheinen hier, sobald sie freigegeben sind.',
    readOnlyChip: 'Nur Ansicht', teacherNote: 'Eine Nachricht von Frau Nadine', teacherNoteText: 'Gut gemacht! Du findest immer besser gleichwertige Brüche.',
    answerFeedback: 'Rückmeldung zu den Antworten', question: 'Frage', childAnswer: 'Malaks Antwort', noFeedback: 'Keine schriftliche Rückmeldung zu dieser Prüfung.',
    progressEyebrow: 'Fortschritt', progressTitle: 'So lernt Malak', progressText: 'Fähigkeiten in den Mathe-Prüfungen',
    states: { Secure: 'Läuft gut', Wobbly: 'Übt noch', 'Known gap': 'Braucht Übung', 'Surprise mistake': 'Unerwarteter Fehler' } as Record<string, string>,
    improved: 'Malak ist jetzt bei „Läuft gut“!',
    support: 'Unterstützung durch die Lehrkraft', supportText: 'Hier stehen nur Lernbedarfe, die Frau Nadine bestätigt hat.', noSupport: 'Gerade gibt es keinen besonderen Lernbedarf. Frau Nadine meldet sich, wenn etwas mehr Übung braucht.', seeGrades: 'Noten und Rückmeldungen ansehen',
    uploadEyebrow: 'Prüfungsseiten hochladen', uploadTitle: 'Malaks Prüfungsseiten senden', uploadText: 'Wähle die Prüfung, füge die Seiten hinzu und sende sie an die Lehrkraft.', uploadChip: 'Du lädst für Malak hoch. Den Sicherheits-Check macht Malak.',
    addTitle: 'Diese Seite hinzufügen?', addText: (file: string, n: number) => `${file} wird als Seite ${n} hinzugefügt.`, addConfirm: 'Seite hinzufügen', adding: 'Wird hinzugefügt...', added: (n: number) => `Seite ${n} hinzugefügt.`,
    sendTitle: 'Diese Seiten an Frau Nadine senden?', sendText: 'Die Lehrkraft bekommt die Seiten sofort. Den Sicherheits-Check macht Malak danach.', sendConfirm: 'Seiten senden', sending: 'Wird gesendet...', sent: 'Seiten gesendet. Frau Nadine kann die Prüfung jetzt prüfen.',
    exam: 'Prüfung', pages: 'Seiten', cancel: 'Abbrechen', close: 'Schließen', retry: 'Erneut versuchen', failed: 'Das hat nicht geklappt. Prüfe die Verbindung und versuche es noch einmal.', dismiss: 'Meldung schließen',
    notifGrade: 'Neue Note freigegeben', notifGradeText: 'Mathetest 2: 8 / 10 mit Rückmeldung der Lehrkraft.', notifFlag: 'Lehrkraft hat einen Lernbedarf bestätigt', notifFlagText: (skill: string) => `${skill}: So kannst du zu Hause helfen.`,
    loading: 'Wird geladen',
  },
}
type Copy = (typeof copy)['en'] | (typeof copy)['de']

/** Confirmed support needs in parent wording (the comparing-fractions text is the app's existing parent copy). */
const supportCopy: Record<Language, Record<string, { title: string; text: string; skill: string }>> = {
  en: {
    'Comparing Fractions': { skill: 'Comparing fractions', title: 'Practice fractions at home', text: 'Ms. Nadine confirmed a recurring difficulty comparing fractions.' },
    'Equivalent Fractions': { skill: 'Equivalent fractions', title: 'Practice equivalent fractions at home', text: 'Ms. Nadine confirmed a recurring difficulty finding equivalent fractions.' },
    'Adding Fractions': { skill: 'Adding fractions', title: 'Practice adding fractions at home', text: 'Ms. Nadine confirmed a recurring difficulty adding fractions.' },
    'Word Problems': { skill: 'Word problems', title: 'Read word problems together', text: 'Ms. Nadine confirmed a recurring difficulty choosing the right step in word problems.' },
  },
  de: {
    'Comparing Fractions': { skill: 'Brüche vergleichen', title: 'Zu Hause Brüche üben', text: 'Frau Nadine hat bestätigt, dass das Vergleichen von Brüchen wiederholt schwerfällt.' },
    'Equivalent Fractions': { skill: 'Gleichwertige Brüche', title: 'Zu Hause gleichwertige Brüche üben', text: 'Frau Nadine hat bestätigt, dass gleichwertige Brüche wiederholt schwerfallen.' },
    'Adding Fractions': { skill: 'Brüche addieren', title: 'Zu Hause Brüche addieren üben', text: 'Frau Nadine hat bestätigt, dass das Addieren von Brüchen wiederholt schwerfällt.' },
    'Word Problems': { skill: 'Textaufgaben', title: 'Textaufgaben gemeinsam lesen', text: 'Frau Nadine hat bestätigt, dass bei Textaufgaben der richtige Rechenschritt wiederholt schwerfällt.' },
  },
}
const supportFor = (language: Language, skill: string) => supportCopy[language][skill] ?? { skill, title: skill, text: '' }

/* -------------------------------------------------------------- data */

type Flag = { studentId: string; skill: string; status: string }
type TeacherAnswer = { examId: string; studentId: string; q: number; confirmed: boolean; score: number; max: number; feedbackEn: string; feedbackDe: string }
type TeacherData = { flags?: Flag[]; answers?: TeacherAnswer[] }

/** Same demo fallbacks as the student view (sample flag: one confirmed, one dismissed). */
const sampleFlags: Flag[] = [{ studentId: 'malak', skill: 'Comparing Fractions', status: 'Confirmed' }, { studentId: 'malak', skill: 'Word Problems', status: 'Dismissed' }]
const sampleWrongFeedback: Record<Language, string> = { en: 'Both fractions have 5 at the bottom, so compare the top numbers: 3 is bigger than 2. You are close!', de: 'Beide Brüche haben unten eine 5. Vergleiche die oberen Zahlen: 3 ist größer als 2. Du bist nah dran!' }

type Exam = { id: string; title: Record<Language, string>; subject: Record<Language, string>; date: Record<Language, string>; score?: string; released: boolean; note?: boolean; answers?: Array<{ number: number; question: Record<Language, string>; answer: string; score: string; correct: boolean }> }
const exams: Exam[] = [
  { id: 'quiz-3', title: { en: 'Math Quiz 3: Fractions', de: 'Mathetest 3: Brüche' }, subject: { en: 'Math', de: 'Mathe' }, date: { en: 'October 18, 2026', de: '18. Oktober 2026' }, released: false },
  { id: 'quiz-2', title: { en: 'Math Quiz 2: Fractions', de: 'Mathetest 2: Brüche' }, subject: { en: 'Math', de: 'Mathe' }, date: { en: 'October 12, 2026', de: '12. Oktober 2026' }, score: '8 / 10', released: true, note: true, answers: [
    { number: 1, question: { en: 'Which fraction is larger: 3/4 or 2/3?', de: 'Welcher Bruch ist größer: 3/4 oder 2/3?' }, answer: '3/4', score: '3 / 3', correct: true },
    { number: 2, question: { en: 'Compare 2/5 and 3/5.', de: 'Vergleiche 2/5 und 3/5.' }, answer: '2/5', score: '1 / 3', correct: false },
    { number: 3, question: { en: 'Which fraction is equivalent to 1/2?', de: 'Welcher Bruch entspricht 1/2?' }, answer: '4/8', score: '4 / 4', correct: true },
  ] },
  { id: 'science-2', title: { en: 'Science Quiz 2: Living Things', de: 'Naturwissenschaftstest 2: Lebewesen' }, subject: { en: 'Science', de: 'Naturwissenschaften' }, date: { en: 'October 8, 2026', de: '8. Oktober 2026' }, released: false },
  { id: 'midterm', title: { en: 'Math Midterm', de: 'Mathe-Zwischenprüfung' }, subject: { en: 'Math', de: 'Mathe' }, date: { en: 'September 2026', de: 'September 2026' }, score: '7 / 10', released: true },
  { id: 'quiz-1', title: { en: 'Math Quiz 1', de: 'Mathetest 1' }, subject: { en: 'Math', de: 'Mathe' }, date: { en: 'September 2026', de: 'September 2026' }, score: '6 / 10', released: true },
]

/** Reads the demo workflow once on mount; `loaded` drives the skeletons. */
function useTeacherData() {
  const [state, setState] = useState<{ loaded: boolean; data: TeacherData | null }>({ loaded: false, data: null })
  useEffect(() => {
    let data: TeacherData | null = null
    try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) data = JSON.parse(saved) as TeacherData } catch { data = null }
    // Short wait so the skeleton is visible instead of a flash of empty content.
    const timer = window.setTimeout(() => setState({ loaded: true, data }), 250)
    return () => window.clearTimeout(timer)
  }, [])
  return state
}
/** FR 71: only flags with status "Confirmed" reach the parent; pending or dismissed ones never do. */
const confirmedFlags = (data: TeacherData | null) => (data?.flags ?? sampleFlags).filter((flag) => flag.studentId === 'malak' && flag.status === 'Confirmed')
/** Teacher feedback on a wrong answer: only confirmed teacher feedback, never an AI suggestion. */
const answerFeedback = (data: TeacherData | null, examId: string, number: number, language: Language) => {
  if (!data?.answers) return number === 2 && examId === 'quiz-2' ? sampleWrongFeedback[language] : ''
  const answer = data.answers.find((item) => item.studentId === 'malak' && item.examId === examId && item.q === number - 1 && item.confirmed)
  return answer ? (language === 'de' ? answer.feedbackDe : answer.feedbackEn) : ''
}

/** FR 72: new grade released + each confirmed red flag. Each item opens its section. */
export function useParentNotifications(language: Language) {
  const { data } = useTeacherData()
  const t = copy[language]
  return [
    { title: t.notifGrade, message: t.notifGradeText, target: 'home', section: 'parent-exam-quiz-2', icon: Star, tone: 'mint' as const },
    ...confirmedFlags(data).map((flag) => ({ title: t.notifFlag, message: t.notifFlagText(supportFor(language, flag.skill).skill), target: 'progress', section: 'parent-support', icon: Heart, tone: 'sun' as const })),
  ]
}

/* -------------------------------------------------------------- feedback (confirm dialog + toast) */

type ConfirmOptions = { title: string; text: string; rows?: Array<[string, string]>; confirmLabel: string; busyLabel: string; icon: ReactNode; onConfirm: () => void }
type Feedback = { confirm: (options: ConfirmOptions) => void; toast: (message: string) => void }
const FeedbackContext = createContext<Feedback>({ confirm: (options) => options.onConfirm(), toast: () => undefined })

function FeedbackProvider({ t, children }: { t: Copy; children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [toastText, setToastText] = useState('')
  const opener = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const toast = useCallback((message: string) => { setToastText(message); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToastText(''), 5000) }, [])
  const confirm = useCallback((options: ConfirmOptions) => { opener.current = document.activeElement as HTMLElement | null; setFailed(false); setBusy(false); setDialog(options) }, [])
  const close = () => { if (busy) return; setDialog(null); opener.current?.focus?.() }
  const run = () => {
    if (!dialog) return
    setBusy(true); setFailed(false)
    // Short visible "working" state, then the real action.
    window.setTimeout(() => {
      try { dialog.onConfirm(); setDialog(null); setBusy(false) } catch { setBusy(false); setFailed(true) }
    }, 600)
  }
  useEffect(() => {
    if (!dialog) return
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      // Keep Tab inside the dialog.
      if (event.key === 'Tab' && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)')]
        if (!items.length) return
        const first = items[0]; const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return <FeedbackContext.Provider value={{ confirm, toast }}>
    {children}
    {dialog && <div className="parent-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <div ref={dialogRef} className="parent-dialog" role="dialog" aria-modal="true" aria-labelledby="parent-dialog-title" aria-describedby="parent-dialog-text" aria-busy={busy}>
        <span className="parent-dialog-icon" aria-hidden="true">{dialog.icon}</span>
        <h2 id="parent-dialog-title">{dialog.title}</h2>
        <p id="parent-dialog-text">{dialog.text}</p>
        {dialog.rows && <dl className="parent-dialog-rows">{dialog.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
        {failed && <div className="parent-banner parent-banner-err" role="alert"><AlertCircle aria-hidden="true" /><span>{t.failed}</span><button type="button" className="parent-text-button" onClick={run}><RotateCcw aria-hidden="true" />{t.retry}</button></div>}
        <div className="parent-dialog-actions">
          <button type="button" className="parent-btn parent-btn-ghost" onClick={close} disabled={busy}>{t.cancel}</button>
          <button type="button" className="parent-btn parent-btn-primary" onClick={run} disabled={busy} data-autofocus>{busy ? <><span className="parent-spinner" aria-hidden="true" />{dialog.busyLabel}</> : dialog.confirmLabel}</button>
        </div>
      </div>
    </div>}
    <div className="parent-toast-region" role="status" aria-live="polite">{toastText && <div className="parent-toast"><CheckCircle2 aria-hidden="true" /><span>{toastText}</span><button type="button" aria-label={t.dismiss} onClick={() => setToastText('')}><X aria-hidden="true" /></button></div>}</div>
  </FeedbackContext.Provider>
}

/* -------------------------------------------------------------- shared pieces */

function ParentHero({ icon, eyebrow, title, text, children }: { icon: ReactNode; eyebrow: string; title: string; text: string; children?: ReactNode }) {
  return <section className="parent-hero">
    <div className="parent-hero-syna" aria-hidden="true"><SynaArt role="parent" /></div>
    <div className="parent-hero-copy"><span className="parent-eyebrow">{icon}{eyebrow}</span><h1>{title}</h1><p>{text}</p>{children}</div>
  </section>
}

/** Status is always icon + text + tint. */
function StatusChip({ released, t }: { released: boolean; t: Copy }) {
  return released ? <span className="parent-chip parent-chip-ok"><CheckCircle2 aria-hidden="true" />{t.confirmed}</span> : <span className="parent-chip parent-chip-wait"><Hourglass aria-hidden="true" />{t.checking}</span>
}

function Skeleton({ label }: { label: string }) {
  return <div className="parent-skeleton" role="status" aria-label={label}>{[0, 1, 2].map((key) => <div className="parent-skeleton-card" key={key}><span /><span /><span /></div>)}</div>
}

/* -------------------------------------------------------------- pages */

function GradesPage({ language, t }: { language: Language; t: Copy }) {
  const { loaded, data } = useTeacherData()
  const openExam = () => { const el = document.getElementById('parent-exam-quiz-2'); el?.scrollIntoView({ behavior: 'smooth', block: 'start' }); el?.focus({ preventScroll: true }) }
  return <>
    <ParentHero icon={<ClipboardList aria-hidden="true" />} eyebrow={t.parentView} title={t.learning} text={t.readOnly}><span className="parent-chip parent-chip-info"><Lock aria-hidden="true" />{t.readOnlyChip}</span></ParentHero>
    {!loaded ? <Skeleton label={t.loading} /> : <>
      <section className="parent-card parent-news" aria-labelledby="parent-news-title">
        <span className="parent-tile parent-tile-mint" aria-hidden="true"><Bell /></span>
        <div><span className="parent-chip parent-chip-ok"><Star aria-hidden="true" />{t.newGrade}</span><h2 id="parent-news-title">{t.released}</h2><p>{t.releasedText} <strong>8 / 10</strong>. {t.releasedText2}</p></div>
        <button type="button" className="parent-btn parent-btn-ghost" onClick={openExam}>{t.readResults}<ArrowRight aria-hidden="true" /></button>
      </section>
      <h2 className="parent-section-title">{t.confirmedGrades}</h2>
      <ul className="parent-exam-list">{exams.map((exam) => <li key={exam.id}>
        <article className={`parent-card parent-exam ${exam.released ? '' : 'is-checking'}`} id={`parent-exam-${exam.id}`} tabIndex={-1} aria-labelledby={`parent-exam-title-${exam.id}`}>
          <header className="parent-exam-head">
            <span className="parent-tile parent-tile-sun" aria-hidden="true">{exam.subject.en === 'Math' ? <Divide /> : <Sprout />}</span>
            <div className="parent-exam-copy"><h3 id={`parent-exam-title-${exam.id}`}>{exam.title[language]}</h3><small>{exam.subject[language]} · {exam.date[language]}</small></div>
            <StatusChip released={exam.released} t={t} />
            {exam.released && exam.score && <span className="parent-score" aria-label={`${exam.score}`}><Star aria-hidden="true" />{exam.score}</span>}
          </header>
          {!exam.released ? <p className="parent-muted"><Info aria-hidden="true" />{t.checkingText}</p> : <div className="parent-exam-body">
            {exam.note ? <div className="parent-note"><span className="parent-tile parent-tile-sky" aria-hidden="true"><MessageCircle /></span><div><strong>{t.teacherNote}</strong><p>{t.teacherNoteText}</p></div></div> : <p className="parent-muted"><Info aria-hidden="true" />{t.noFeedback}</p>}
            {exam.answers && <><h4>{t.answerFeedback}</h4><ol className="parent-answer-list">{exam.answers.map((answer) => { const feedback = answer.correct ? '' : answerFeedback(data, exam.id, answer.number, language); return <li key={answer.number} className={answer.correct ? 'is-correct' : 'is-wrong'}>
              <span className="parent-q" aria-hidden="true">{answer.number}</span>
              <div><strong><span className="sr-only">{t.question} {answer.number}: </span>{answer.question[language]}</strong><small>{t.childAnswer}: <b>{answer.answer}</b></small>{feedback && <p className="parent-answer-feedback"><MessageCircle aria-hidden="true" />{feedback}</p>}</div>
              <span className={`parent-chip ${answer.correct ? 'parent-chip-ok' : 'parent-chip-wait'}`}>{answer.correct ? <CheckCircle2 aria-hidden="true" /> : <Sprout aria-hidden="true" />}{answer.score}</span>
            </li> })}</ol></>}
          </div>}
        </article>
      </li>)}</ul>
    </>}
  </>
}

function SupportCard({ language, t, setScreen }: { language: Language; t: Copy; setScreen: (screen: string) => void }) {
  const { loaded, data } = useTeacherData()
  const flags = confirmedFlags(data)
  return <section className="parent-card parent-support" id="parent-support" tabIndex={-1} aria-labelledby="parent-support-title">
    <header><span className="parent-tile parent-tile-coral" aria-hidden="true"><Heart /></span><div><h2 id="parent-support-title">{t.support}</h2><p>{t.supportText}</p></div></header>
    {!loaded ? <Skeleton label={t.loading} /> : flags.length ? <ul className="parent-support-list">{flags.map((flag) => { const item = supportFor(language, flag.skill); return <li key={flag.skill}><Flag aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.text}</p></div></li> })}</ul>
      : <div className="parent-empty"><span className="parent-tile parent-tile-mint" aria-hidden="true"><CheckCircle2 /></span><p>{t.noSupport}</p><button type="button" className="parent-btn parent-btn-ghost" onClick={() => setScreen('home')}>{t.seeGrades}<ArrowRight aria-hidden="true" /></button></div>}
  </section>
}

function UploadPage({ language, t, setScreen }: { language: Language; t: Copy; setScreen: (screen: string) => void }) {
  const { confirm, toast } = useContext(FeedbackContext)
  const hero = <ParentHero icon={<FileUp aria-hidden="true" />} eyebrow={t.uploadEyebrow} title={t.uploadTitle} text={t.uploadText}><span className="parent-chip parent-chip-info"><Info aria-hidden="true" />{t.uploadChip}</span></ParentHero>
  const pageCount = useRef(0)
  return <StudentUploadFlow language={language} onHome={() => setScreen('home')} studentName={CHILD} uploadedBy="parent" hero={hero}
    confirmAddPage={(file, add) => confirm({ title: t.addTitle, text: t.addText(file, pageCount.current + 1), confirmLabel: t.addConfirm, busyLabel: t.adding, icon: <Upload />, onConfirm: add })}
    onPageAdded={(count) => { pageCount.current = count; toast(t.added(count)) }}
    confirmSubmit={(pages, examName, send) => confirm({ title: t.sendTitle, text: t.sendText, rows: [[t.exam, examName], [t.pages, String(pages)]], confirmLabel: t.sendConfirm, busyLabel: t.sending, icon: <FileUp />, onConfirm: () => { send(); toast(t.sent) } })} />
}

/** Entry point used by the app shell for role "parent". */
export function ParentView({ screen, language, setScreen, Progress }: {
  screen: string; language: Language; setScreen: (screen: string) => void
  Progress: ComponentType<{ setScreen: (screen: string) => void; hero?: ReactNode; stateLabel?: (state: string) => string; improvedText?: string; support?: ReactNode }>
}) {
  const t = copy[language]
  const page = screen === 'progress'
    ? <div className="parent-progress"><Progress setScreen={setScreen} hero={<ParentHero icon={<Sprout aria-hidden="true" />} eyebrow={t.progressEyebrow} title={t.progressTitle} text={t.progressText} />} stateLabel={(state) => t.states[state] ?? state} improvedText={t.improved} support={<SupportCard language={language} t={t} setScreen={setScreen} />} /></div>
    : screen === 'upload' ? <UploadPage language={language} t={t} setScreen={setScreen} />
      : <GradesPage language={language} t={t} />
  return <FeedbackProvider t={t}><div className="parent-page" lang={language}>{page}</div></FeedbackProvider>
}
