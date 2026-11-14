'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, BookOpen, Calendar, Check, ChevronLeft, ChevronRight, CircleAlert, CircleHelp, ClipboardCheck, Download, Eye, FileText, Flag, GraduationCap, Inbox, Languages, Lock, Meh, MessageSquare, Pencil, Plus, ScanLine, Send, Smile, Sparkles, StickyNote, Trash2, Upload, Users, X, ZoomIn, ZoomOut } from 'lucide-react'
import { TeacherShell } from '@/components/teacher/TeacherShell'
import type { TeacherChrome } from '@/components/teacher/TeacherHeader'
import { PageHeader } from '@/components/teacher/PageHeader'
import { WorkflowStepper } from '@/components/teacher/WorkflowStepper'
import { Alert, Avatar, Badge, Button, Card, CardHeader, DescriptionList, EmptyState, ErrorSummary, LinkButton, ListItem, Modal, ProgressBar, Segmented, SelectField, StatCard, Tabs, TextArea, TextField, Toggle, cx, formatDate, stateTone } from '@/components/teacher/ui'

type Screen = 'dashboard' | 'exams' | 'create' | 'verify' | 'grades' | 'gaps' | 'profile' | 'help'
type Student = { id: string; name: string }
type Exam = { id: string; title: string; subject: string; className: string; language: 'English' | 'German'; date: string; modelFile: string; modelText: string; sureCheck: boolean; faces: boolean; status: string; released: boolean; questions?: Array<{ prompt: string; skill: string; max: number; expected: string }> }
type Answer = { examId: string; studentId: string; q: number; response: string; sure: 'Sure' | 'Not sure' | 'Guessed'; score: number; ai: number; max: number; state: string; cause: string; confirmed: boolean; overrideReason: string; feedbackEn: string; feedbackDe: string; germanKeyword: string; englishTranslation: string; unreadable: boolean; verified: boolean; matched: string; missed: string }
type HelpRequest = { id: string; studentId: string; topic: string; message: string; status: string; booking: string }
type FlagRecord = { id: string; studentId: string; skill: string; reason: string; answers: string; status: 'Pending' | 'Confirmed' | 'Dismissed'; comment: string }
type PracticeAssignment = { id: string; studentId: string; skill: string; exercises: string[] }
type Data = { exams: Exam[]; answers: Answer[]; help: HelpRequest[]; flags: FlagRecord[]; notes: Record<string, string>; sent: string[]; regradeChecks: string[]; practiceAssignments: PracticeAssignment[] }

const students: Student[] = [
  { id: 'malak', name: 'Malak Adel' }, { id: 'omar', name: 'Omar Khaled' }, { id: 'laila', name: 'Laila Samir' },
  { id: 'youssef', name: 'Youssef Ali' }, { id: 'nour', name: 'Nour Hassan' }, { id: 'karim', name: 'Karim Mostafa' },
]
const questions = [
  { prompt: 'Which fraction is larger: 3/4 or 2/3?', skill: 'Comparing Fractions', max: 3, expected: '3/4 is larger because 9/12 is greater than 8/12.' },
  { prompt: 'Which fraction is equivalent to 1/2?', skill: 'Equivalent Fractions', max: 3, expected: '4/8 is equivalent to 1/2.' },
  { prompt: 'What is 5/8 + 1/8?', skill: 'Adding Fractions', max: 4, expected: '5/8 + 1/8 = 6/8.' },
]
const languageTermsByQuestion = [
  { german: 'größer', english: 'larger' },
  { german: 'gleichwertig', english: 'equivalent' },
  { german: 'Summe', english: 'sum' },
]
const initialExams: Exam[] = [
  { id: 'quiz-3', title: 'Math Quiz 3: Fractions', subject: 'Math', className: 'Class 4B', language: 'English', date: '2026-10-18', modelFile: 'model-answer-fractions.pdf', modelText: questions.map((item, index) => `Q${index + 1}: ${item.expected}`).join('\n'), sureCheck: true, faces: false, status: 'Text verification', released: false },
  { id: 'quiz-2', title: 'Math Quiz 2: Fractions', subject: 'Math', className: 'Class 4B', language: 'English', date: '2026-10-12', modelFile: 'model-answer-quiz-2.pdf', modelText: 'Q1: Compare equal-denominator fractions. Q2: Find equivalent fractions. Q3: Explain the answer.', sureCheck: true, faces: false, status: 'Released', released: true },
  { id: 'science-2', title: 'Science Quiz 2: Living Things', subject: 'Science', className: 'Class 4B', language: 'German', date: '2026-10-08', modelFile: 'science-model.pdf', modelText: 'A habitat provides food, water, and shelter.', sureCheck: true, faces: false, status: 'Awaiting confirmation', released: false },
]
const responses = [
  ['2/5 is larger because 2 is smaller than 3.', '2/4 = 1/2 because they have the same value.', '5/8 + 1/8 = 6/8.'],
  ['3/5 is larger because 3 is greater than 2.', '3/6 = 1/2.', '5/8 + 1/8 = 6/8.'],
  ['2/5 is larger because 2 is smaller than 3.', '2/4 is equivalent to 1/2.', '5/8 + 1/8 = 6/8.'],
  ['2/5 is larger because 2 is smaller than 3.', '4/8 is equivalent to 1/2.', '6/8 is the sum.'],
  ['3/5 is larger because 3 is greater than 2.', '4/8 is equivalent to 1/2.', '5/8 + 1/8 = 6/8.'],
  ['3/5 is larger because 3 is greater than 2.', '4/8 is equivalent to 1/2.', '5/8 + 1/8 = 6/8.'],
]
const initialAnswers: Answer[] = students.flatMap((student, si) => questions.map((question, qi) => {
  const correct = qi === 0 ? si >= 1 && si !== 3 : qi === 1 ? si !== 0 : si !== 3
  const score = correct ? question.max : qi === 0 ? 1 : 2
  const sure = si === 0 && qi === 0 || si === 2 && qi === 0 ? 'Sure' : si === 3 && qi === 2 ? 'Guessed' : correct ? 'Sure' : 'Not sure'
  const state = correct ? 'Secure' : sure === 'Sure' ? 'Surprise mistake' : sure === 'Guessed' ? 'Wobbly' : 'Known gap'
  return { examId: 'quiz-3', studentId: student.id, q: qi, response: responses[si][qi], sure, score, ai: score, max: question.max, state, cause: correct ? 'No issue' : si === 3 ? 'Careless slip' : 'Concept error', confirmed: false, overrideReason: '', feedbackEn: correct ? 'Great reasoning. Keep explaining how you found your answer.' : 'Let’s compare the fractions carefully. Look at the numerators when denominators match.', feedbackDe: correct ? 'Gut begründet. Erkläre weiterhin, wie du die Antwort gefunden hast.' : 'Vergleiche die Brüche sorgfältig. Achte auf die Zähler, wenn die Nenner gleich sind.', germanKeyword: '', englishTranslation: '', unreadable: false, verified: false, matched: correct ? question.expected : 'Identified the fractions in the question', missed: correct ? 'Nothing missed' : 'The comparison rule or equivalent value was not applied' }
}))
const initialHistoricalAnswers = initialAnswers.map((answer) => ({ ...answer, examId: 'quiz-2', confirmed: true, verified: true, overrideReason: '', cause: answer.cause === 'Concept error' ? 'Concept error' : 'No issue' }))
const initialData: Data = {
  exams: initialExams, answers: [...initialHistoricalAnswers, ...initialAnswers],
  help: [
    { id: 'help-1', studentId: 'malak', topic: 'Comparing fractions', message: 'I still do not know how to tell which fraction is bigger. Can we practise together?', status: 'New', booking: '' },
    { id: 'help-2', studentId: 'omar', topic: 'Word problems', message: 'Can you help me understand which operation to use?', status: 'New', booking: '' },
    { id: 'help-3', studentId: 'laila', topic: 'Equivalent fractions', message: 'I need another example before the next quiz.', status: 'New', booking: '' },
  ],
  flags: [
    { id: 'flag-1', studentId: 'malak', skill: 'Comparing Fractions', reason: 'Surprise mistakes repeated across Math Quiz 2 and Math Quiz 3.', answers: 'Math Quiz 2 · Q2; Math Quiz 3 · Q1', status: 'Pending', comment: '' },
    { id: 'flag-2', studentId: 'omar', skill: 'Word Problems', reason: 'Known gaps repeated in the same skill across two exams.', answers: 'Math Quiz 2 · Q4; Science Quiz 2 · Q3', status: 'Pending', comment: '' },
  ], notes: {}, sent: [], regradeChecks: [],
  practiceAssignments: [
    { id: 'practice-mal-compare', studentId: 'malak', skill: 'Comparing Fractions', exercises: ['Compare 3/4 and 2/3. Which is larger?', 'Make the bottom numbers the same for 2/5 and 3/5.'] },
    { id: 'practice-mal-equivalent', studentId: 'malak', skill: 'Equivalent Fractions', exercises: ['Write an equivalent fraction for 1/2.', 'Complete: 2/4 = __ / 8.'] },
  ],
}
const stateHelp = 'Secure: correct and sure. Wobbly: correct but unsure, or guessed. Known gap: incorrect and unsure. Surprise mistake: incorrect despite feeling sure.'
const questionsForExam = (examId: string, exams: Exam[] = initialExams) => exams.find((item) => item.id === examId)?.questions ?? (examId === 'science-2' ? [{ prompt: 'What does a habitat provide?', skill: 'Animal Habitats', max: 4, expected: 'Food, water, and shelter.' }, ...questions.slice(1)] : questions)
/**
 * Maps the teacher's model-answer criteria to questions (0-based index).
 * - Labelled text ("Q1: …", one per line or several on one line) is matched
 *   by its label, so the order of lines does not matter.
 * - Text without any "Qn:" labels is matched line by line, in order.
 * Grading and regrading both use this, so every answer is compared only with
 * the criterion the teacher wrote for that exact question.
 */
const parseModelCriteria = (text: string): string[] => {
  const labels = [...text.matchAll(/\bQ(\d+)\s*:/gi)]
  if (!labels.length) return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const criteria: string[] = []
  labels.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length
    const end = index + 1 < labels.length ? labels[index + 1].index ?? text.length : text.length
    const value = text.slice(start, end).trim()
    const question = Number(match[1]) - 1
    if (value && question >= 0 && criteria[question] === undefined) criteria[question] = value
  })
  return criteria
}
const person = (id: string) => students.find((student) => student.id === id) ?? students[0]

function useTeacherData() {
  const [data, setData] = useState<Data>(initialData)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try { const saved = window.localStorage.getItem('synapse-teacher-workflow-v1'); if (saved) setData({ ...initialData, ...JSON.parse(saved) }) } catch { /* Ignore invalid demo data and keep the safe fixtures. */ }
    setReady(true)
  }, [])
  useEffect(() => { if (ready) window.localStorage.setItem('synapse-teacher-workflow-v1', JSON.stringify(data)) }, [data, ready])
  return [data, setData] as const
}

/* ============================================================================
 * Workspace root — owns data, the selected exam and toast state, and renders
 * the current screen inside the shared TeacherShell (header, nav, footer).
 * ========================================================================== */

export function TeacherWorkspace({ screen, setScreen, chrome }: { screen: string; setScreen: (screen: string) => void; chrome?: TeacherChrome }) {
  const [data, setData] = useTeacherData()
  const [selectedExam, setSelectedExam] = useState('quiz-3')
  const [notice, setNotice] = useState('')
  const exam = data.exams.find((item) => item.id === selectedExam) ?? data.exams[0]
  const update = (transform: (current: Data) => Data) => setData(transform)
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3600) }
  const go = (next: Screen) => setScreen(next)
  const newHelp = data.help.filter((item) => item.status === 'New').length
  return <TeacherShell screen={screen} onNavigate={go} helpCount={newHelp} chrome={chrome} toast={notice} onDismissToast={() => setNotice('')}>
    {screen === 'dashboard' && <Dashboard data={data} setScreen={go} setExam={(id) => { setSelectedExam(id); go('exams') }} />}
    {screen === 'exams' && <ExamList data={data} setScreen={go} setExam={setSelectedExam} />}
    {screen === 'create' && <CreateExam data={data} update={update} setScreen={go} notify={notify} />}
    {screen === 'verify' && <VerifyText exam={exam} answers={data.answers} update={update} setScreen={go} notify={notify} />}
    {screen === 'grades' && <GradeReview exam={exam} answers={data.answers} data={data} update={update} setScreen={go} notify={notify} setExam={setSelectedExam} />}
    {screen === 'gaps' && <LearningGaps data={data} update={update} setScreen={go} notify={notify} />}
    {screen === 'profile' && <StudentProfile data={data} update={update} setScreen={go} notify={notify} />}
    {screen === 'help' && <HelpInbox data={data} update={update} setScreen={go} notify={notify} />}
  </TeacherShell>
}

/** Breadcrumb root shared by every exam sub-page. */
const examsCrumb = (setScreen: (screen: Screen) => void) => ({ label: 'Exams', onClick: () => setScreen('exams') })

/* ============================================================================
 * Dashboard — overview + "what needs me next" (counts link to the work).
 * ========================================================================== */

function Dashboard({ data, setScreen, setExam }: { data: Data; setScreen: (screen: Screen) => void; setExam: (id: string) => void }) {
  const uploaded = new Set(data.answers.map((item) => `${item.examId}:${item.studentId}`)).size
  const waitingText = new Set(data.answers.filter((item) => !item.verified && !item.unreadable).map((item) => `${item.examId}:${item.studentId}`)).size
  const waitingGrade = new Set(data.answers.filter((item) => item.verified && !item.confirmed).map((item) => `${item.examId}:${item.studentId}`)).size
  const pendingFlags = data.flags.filter((item) => item.status === 'Pending')
  const newRequests = data.help.filter((item) => item.status === 'New')
  return <>
    <PageHeader title="Good morning, Ms. Nadine" description="Your class overview and the next steps that need your attention." actions={<Button icon={<Plus size={16} />} onClick={() => setScreen('create')}>Create exam</Button>}>
      <div className="t-context-bar">
        <label className="t-inline-select">Class<select className="t-input t-select" defaultValue="Class 4B"><option>Class 4B</option><option>Class 4A</option></select></label>
        <span><GraduationCap size={16} aria-hidden="true" /> Grade 4 · 24 students</span>
        <span><Languages size={16} aria-hidden="true" /> English and German</span>
      </div>
    </PageHeader>

    <div className="t-grid t-grid-4">
      <StatCard label="Papers uploaded" value={uploaded} detail="Across active exams" icon={<Upload size={18} />} onClick={() => setScreen('exams')} />
      <StatCard label="Text verification" value={waitingText} detail="Papers need a text check" icon={<ScanLine size={18} />} onClick={() => setScreen('verify')} />
      <StatCard label="Grade confirmation" value={waitingGrade} detail="AI suggestions ready" icon={<ClipboardCheck size={18} />} onClick={() => setScreen('grades')} />
      <StatCard label="Released papers" value={data.exams.filter((item) => item.released).length} detail="Students notified" icon={<Check size={18} />} onClick={() => setScreen('exams')} />
    </div>

    <div className="t-grid t-grid-main">
      <Card padded={false}>
        <CardHeader title="Your exams" description="Progress of each assessment through the workflow." action={<LinkButton onClick={() => setScreen('exams')}>View all <ChevronRight size={14} /></LinkButton>} />
        <ul className="t-rows">{data.exams.map((item) => {
          const studentAnswers = data.answers.filter((answer) => answer.examId === item.id)
          const examUploaded = new Set(studentAnswers.map((answer) => answer.studentId)).size
          const textCheck = new Set(studentAnswers.filter((answer) => !answer.verified && !answer.unreadable).map((answer) => answer.studentId)).size
          const gradeReview = new Set(studentAnswers.filter((answer) => answer.verified && !answer.confirmed).map((answer) => answer.studentId)).size
          return <li className="t-exam-row" key={item.id}>
            <span className="t-row-icon" aria-hidden="true"><FileText size={18} /></span>
            <div className="t-exam-info">
              <strong>{item.title}</strong>
              <small>{item.className} · {item.subject} · {formatDate(item.date)}</small>
              <div className="t-counts"><span>{examUploaded} uploaded</span><span>{textCheck} text check</span><span>{gradeReview} grade review</span></div>
            </div>
            <Badge tone={item.released ? 'success' : 'warning'} dot>{item.status}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setExam(item.id)}>Open exam</Button>
          </li>
        })}</ul>
      </Card>

      <div className="t-stack">
        <Card padded={false}>
          <CardHeader title="Open red flags" action={<Badge tone={pendingFlags.length ? 'warning' : 'neutral'}>{pendingFlags.length} pending</Badge>} />
          {pendingFlags.length ? <div className="t-list">{pendingFlags.map((flag) => <ListItem key={flag.id} onClick={() => setScreen('gaps')} leading={<span className="t-row-icon t-row-icon-warning" aria-hidden="true"><Flag size={16} /></span>} title={`${person(flag.studentId).name} · ${flag.skill}`} subtitle={flag.reason} trailing={<ChevronRight size={16} />} />)}</div>
            : <EmptyState title="No open red flags." />}
          <footer className="t-card-footer"><LinkButton onClick={() => setScreen('gaps')}>Review learning gaps <ArrowRight size={14} /></LinkButton></footer>
        </Card>
        <Card padded={false}>
          <CardHeader title="New help requests" action={<Badge tone={newRequests.length ? 'warning' : 'neutral'}>{newRequests.length} new</Badge>} />
          {newRequests.length ? <div className="t-list">{newRequests.slice(0, 2).map((request) => <ListItem key={request.id} onClick={() => setScreen('help')} leading={<Avatar name={person(request.studentId).name} />} title={person(request.studentId).name} subtitle={request.topic} trailing={<ChevronRight size={16} />} />)}</div>
            : <EmptyState title="No new help requests." />}
          <footer className="t-card-footer"><LinkButton onClick={() => setScreen('help')}>Open inbox <ArrowRight size={14} /></LinkButton></footer>
        </Card>
      </div>
    </div>

    <Card className="t-workflow-card">
      <CardHeader title="Assessment workflow" description="Every exam follows the same four steps. Only teacher-confirmed results are shared with students." />
      <WorkflowStepper />
    </Card>
  </>
}

/* ============================================================================
 * Exams list — one table, one "next step" action per exam.
 * ========================================================================== */

function ExamList({ data, setScreen, setExam }: { data: Data; setScreen: (screen: Screen) => void; setExam: (id: string) => void }) {
  return <>
    <PageHeader title="Exams and papers" description="Follow every assessment from upload through release." actions={<Button icon={<Plus size={16} />} onClick={() => setScreen('create')}>Create exam</Button>} />
    <Card padded={false}>
      <div className="t-table-wrap">
        <table className="t-table">
          <thead><tr><th scope="col">Exam</th><th scope="col">Class · date</th><th scope="col">Workflow status</th><th scope="col">Papers</th><th scope="col"><span className="t-sr-only">Next step</span></th></tr></thead>
          <tbody>{data.exams.map((exam) => {
            const count = exam.id === 'quiz-3' ? 6 : Math.max(0, Math.ceil(data.answers.filter((answer) => answer.examId === exam.id).length / 3))
            return <tr key={exam.id}>
              <td data-label="Exam"><strong>{exam.title}</strong><small>{exam.subject} · {exam.language}</small></td>
              <td data-label="Class · date">{exam.className}<small>{formatDate(exam.date)}</small></td>
              <td data-label="Status"><Badge tone={exam.released ? 'success' : 'warning'} dot>{exam.status}</Badge></td>
              <td data-label="Papers">{count} uploaded</td>
              <td className="t-cell-action"><Button variant="secondary" size="sm" onClick={() => { setExam(exam.id); setScreen(exam.status === 'Text verification' ? 'verify' : 'grades') }}>Review <ArrowRight size={14} /></Button></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </Card>
  </>
}

/* ============================================================================
 * Create exam — four numbered sections, one sticky save bar.
 * ========================================================================== */

/** Skill tags offered per subject (Science tags match the student help topics). */
const skillsBySubject: Record<string, string[]> = {
  Math: ['Multiplication', 'Comparing Fractions', 'Adding Fractions', 'Word Problems', 'Equivalent Fractions'],
  Science: ['Living Things', 'Matter and Materials', 'Animal Habitats'],
}
const allowedModelFiles = ['.pdf', '.doc', '.docx']
const MAX_MARKS = 100
type QuestionRow = { question: string; marks: string; skill: string }

function CreateExam({ data, update, setScreen, notify }: { data: Data; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState('Math'); const [className, setClassName] = useState('Class 4B'); const [language, setLanguage] = useState<'English' | 'German'>('English'); const [date, setDate] = useState('2026-11-20'); const [modelFile, setModelFile] = useState(''); const [modelText, setModelText] = useState(''); const [sureCheck, setSureCheck] = useState(true)
  // Face icons are designed for Grades 1–2; both classes here are Grade 4, so they start off.
  const [faces, setFaces] = useState(false)
  const [rows, setRows] = useState<QuestionRow[]>([{ question: 'Compare 3/4 and 2/3', marks: '3', skill: 'Comparing Fractions' }, { question: 'Find an equivalent fraction for 1/2', marks: '3', skill: 'Equivalent Fractions' }, { question: 'Solve 5/8 + 1/8', marks: '4', skill: 'Adding Fractions' }])
  const [fileError, setFileError] = useState('')
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const touch = (key: string) => setTouched((current) => current.has(key) ? current : new Set(current).add(key))
  const updateRow = (index: number, patch: Partial<QuestionRow>) => setRows((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item))
  const skillOptions = skillsBySubject[subject] ?? []
  const criteria = parseModelCriteria(modelText)
  const totalMarks = rows.reduce((sum, row) => sum + (Number.isInteger(Number(row.marks)) && Number(row.marks) > 0 ? Number(row.marks) : 0), 0)

  /* ---- validation: one specific, actionable message per field ---- */
  const errors: Record<string, string> = {}
  if (!title.trim()) errors.title = 'Enter an exam title.'
  else if (data.exams.some((exam) => exam.className === className && exam.title.trim().toLowerCase() === title.trim().toLowerCase())) errors.title = `${className} already has an exam called “${title.trim()}”. Use a different title.`
  if (!date) errors.date = 'Choose the exam date.'
  if (fileError) errors.modelFile = fileError
  else if (!modelFile) errors.modelFile = 'Upload the approved model answer file (PDF, DOC or DOCX).'
  if (!modelText.trim()) errors.modelText = 'Enter the model answer criteria, one per question (for example, “Q1: 3/4 is larger”).'
  else {
    const extra = criteria.map((value, index) => value !== undefined && index >= rows.length ? index + 1 : 0).filter(Boolean)
    if (extra.length) errors.modelText = `Criteria for Q${extra.join(', Q')} ${extra.length > 1 ? 'have' : 'has'} no matching question. Remove ${extra.length > 1 ? 'them' : 'it'} or add a question.`
  }
  rows.forEach((row, index) => {
    const n = index + 1
    if (!row.question.trim()) errors[`q${index}-question`] = `Enter the text of question ${n}.`
    if (!row.marks.trim()) errors[`q${index}-marks`] = `Enter the marks for question ${n}.`
    else if (!Number.isInteger(Number(row.marks)) || Number(row.marks) < 1 || Number(row.marks) > MAX_MARKS) errors[`q${index}-marks`] = `Use a whole number from 1 to ${MAX_MARKS}.`
    if (!row.skill) errors[`q${index}-skill`] = `Choose the skill question ${n} tests.`
    if (modelText.trim() && !criteria[index]) errors[`q${index}-criterion`] = `Question ${n} has no model answer. Add a line starting with “Q${n}:” in the model answer criteria.`
  })
  // A field shows its error once the teacher has left it, or after a save attempt.
  const show = (key: string) => (submitted || touched.has(key) ? errors[key] : undefined)
  const showCriterion = (index: number) => (submitted || touched.has('modelText') ? errors[`q${index}-criterion`] : undefined)

  /** Order, labels and target fields for the error summary. */
  const fieldMeta: Array<{ key: string; fieldId: string; label: string }> = [
    { key: 'title', fieldId: 'create-title', label: 'Exam title' },
    { key: 'date', fieldId: 'create-date', label: 'Exam date' },
    { key: 'modelFile', fieldId: 'create-modelFile', label: 'Model answer file' },
    { key: 'modelText', fieldId: 'create-modelText', label: 'Model answer criteria' },
    ...rows.flatMap((_, index) => [
      { key: `q${index}-question`, fieldId: `create-q${index}-question`, label: `Q${index + 1} question` },
      { key: `q${index}-marks`, fieldId: `create-q${index}-marks`, label: `Q${index + 1} marks` },
      { key: `q${index}-skill`, fieldId: `create-q${index}-skill`, label: `Q${index + 1} skill tag` },
      { key: `q${index}-criterion`, fieldId: 'create-modelText', label: `Q${index + 1} model answer` },
    ]),
  ]
  const summary = fieldMeta.filter((item) => errors[item.key]).map((item) => ({ fieldId: item.fieldId, label: item.label, message: errors[item.key] }))

  const chooseFile = (file: File | undefined) => {
    touch('modelFile')
    if (!file) return
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowedModelFiles.includes(extension)) { setFileError(`“${file.name}” is not a PDF, DOC or DOCX file. Choose the model answer in one of these formats.`); setModelFile(''); return }
    setFileError(''); setModelFile(file.name)
  }
  const changeSubject = (value: string) => {
    setSubject(value)
    // Skill tags belong to a subject; clear tags that the new subject does not offer.
    setRows((items) => items.map((item) => (skillsBySubject[value] ?? []).includes(item.skill) ? item : { ...item, skill: '' }))
  }
  const isDirty = Boolean(title.trim() || modelFile || modelText.trim())
  const cancel = () => (isDirty ? setConfirmDiscard(true) : setScreen('exams'))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (summary.length) { window.setTimeout(() => { summaryRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); summaryRef.current?.focus({ preventScroll: true }) }, 0); return }
    const id = `exam-${Date.now()}`
    update((current) => ({ ...current, exams: [{ id, title: title.trim(), subject, className, language, date, modelFile, modelText: modelText.trim(), sureCheck, faces: sureCheck && faces, status: 'Uploaded', released: false, questions: rows.map((row, index) => ({ prompt: row.question.trim(), skill: row.skill, max: Number(row.marks), expected: criteria[index] })) }, ...current.exams] }))
    notify(`“${title.trim()}” saved for ${className}. It is ready for student uploads.`)
    setScreen('exams')
  }

  return <>
    <PageHeader crumbs={[examsCrumb(setScreen), { label: 'Create exam' }]} title="Create an exam" description="Set the model answer and marking criteria before students upload papers. Fields marked * are required." />
    {submitted && summary.length > 0 && <ErrorSummary summaryRef={summaryRef} title={`Fix ${summary.length} ${summary.length === 1 ? 'field' : 'fields'} before saving the exam`} errors={summary} />}
    <form onSubmit={submit} className="t-form" noValidate>
      <Card>
        <CardHeader step={1} title="Exam information" description="Subject, class, language and date of the assessment." />
        <div className="t-form-grid">
          <div className="t-span-2"><TextField id="create-title" label="Exam title" value={title} onChange={setTitle} onBlur={() => touch('title')} error={show('title')} required placeholder="e.g. Math Quiz 4: Fractions" /></div>
          <SelectField label="Subject" value={subject} options={Object.keys(skillsBySubject)} onChange={changeSubject} hint="Changing the subject updates the skill tags you can choose." />
          <SelectField label="Class" value={className} options={['Class 4B', 'Class 4A']} onChange={setClassName} />
          <SelectField label="Exam language" value={language} options={['English', 'German']} onChange={(value) => setLanguage(value as 'English' | 'German')} />
          <TextField id="create-date" label="Exam date" value={date} onChange={setDate} onBlur={() => touch('date')} error={show('date')} type="date" required />
        </div>
      </Card>

      <Card>
        <CardHeader step={2} title="Model answer" description="AI grading uses only the answers and marks you enter here." action={<Badge>Teacher provided</Badge>} />
        <div className={cx('t-field', show('modelFile') && 'has-error')}>
          <span className="t-field-label">Approved model answer file<span className="t-required" aria-hidden="true"> *</span></span>
          <div className="t-file-row">
            <label className={cx('t-dropzone', modelFile && 'has-file', show('modelFile') && 'has-error')}>
              <span className="t-row-icon" aria-hidden="true">{modelFile ? <FileText size={18} /> : <Upload size={18} />}</span>
              <span><strong>{modelFile || 'Upload approved model answer'}</strong><small>{modelFile ? 'Ready · this file is the approved marking reference' : 'PDF, DOC or DOCX'}</small></span>
              <span className="t-dropzone-cta">{modelFile ? 'Replace file' : 'Choose file'}</span>
              <input id="create-modelFile" aria-label="Upload model answer" aria-required="true" aria-invalid={show('modelFile') ? true : undefined} aria-describedby={show('modelFile') ? 'create-modelFile-error' : undefined} type="file" accept={allowedModelFiles.join(',')} onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = '' }} />
            </label>
            {modelFile && <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => { setModelFile(''); touch('modelFile') }}>Remove</Button>}
          </div>
          {show('modelFile') && <small className="t-error" id="create-modelFile-error"><CircleAlert size={13} aria-hidden="true" />{show('modelFile')}</small>}
        </div>
        <TextArea id="create-modelText" label="Model answer criteria" rows={4} required value={modelText} onChange={setModelText} onBlur={() => touch('modelText')} error={show('modelText')} hint="Start each criterion with its question number, e.g. “Q1: …”. Each question below shows the criterion it will be graded against." placeholder={'Q1: 3/4 is larger because 9/12 is greater than 8/12.\nQ2: 4/8 is equivalent to 1/2.\nQ3: 5/8 + 1/8 = 6/8.'} />
      </Card>

      <Card>
        <CardHeader step={3} title="Questions, marks and skills" description={`Every question needs its text, whole-number marks and the skill it tests. Total: ${totalMarks} ${totalMarks === 1 ? 'mark' : 'marks'}.`} action={<Button variant="secondary" size="sm" icon={<Plus size={15} />} onClick={() => setRows((items) => [...items, { question: '', marks: '1', skill: '' }])}>Add question</Button>} />
        <div className="t-question-list">{rows.map((row, index) => <div className={cx('t-question-row', (show(`q${index}-question`) || show(`q${index}-marks`) || show(`q${index}-skill`) || showCriterion(index)) && 'has-error')} key={index}>
          <span className="t-question-number">Q{index + 1}</span>
          <TextField id={`create-q${index}-question`} label="Question" value={row.question} onChange={(value) => updateRow(index, { question: value })} onBlur={() => touch(`q${index}-question`)} error={show(`q${index}-question`)} required />
          <TextField id={`create-q${index}-marks`} label="Marks" value={row.marks} onChange={(value) => updateRow(index, { marks: value })} onBlur={() => touch(`q${index}-marks`)} error={show(`q${index}-marks`)} required type="number" min={1} max={MAX_MARKS} step={1} />
          <SelectField id={`create-q${index}-skill`} label="Skill tag" value={row.skill} options={[{ value: '', label: 'Choose a skill' }, ...skillOptions.map((skill) => ({ value: skill, label: skill }))]} onChange={(value) => { updateRow(index, { skill: value }); touch(`q${index}-skill`) }} onBlur={() => touch(`q${index}-skill`)} error={show(`q${index}-skill`)} required />
          <Button variant="ghost" size="sm" ariaLabel={`Remove question ${index + 1}`} icon={<Trash2 size={15} />} disabled={rows.length === 1} onClick={() => setRows((items) => items.filter((_, i) => i !== index))} />
          <div className={cx('t-question-criterion', showCriterion(index) && 'is-missing')}>
            {criteria[index] ? <><span className="t-overline">Graded against</span><span>{criteria[index]}</span></>
              : showCriterion(index) ? <><CircleAlert size={13} aria-hidden="true" /><span>{showCriterion(index)}</span></>
              : <span className="t-muted">Model answer: add “Q{index + 1}: …” to the criteria above.</span>}
          </div>
        </div>)}</div>
      </Card>

      <Card>
        <CardHeader step={4} title="Sure-Check" description={`Confidence settings for ${className}. Students rate how sure they were after each answer.`} action={<Badge tone={sureCheck ? 'success' : 'neutral'}>{sureCheck ? 'On' : 'Off'}</Badge>} />
        <div className="t-toggle-list">
          <Toggle label="Sure-Check" detail={sureCheck ? 'Students choose Sure, Not sure or Guessed for each answer.' : 'Off: students will not be asked how sure they felt.'} checked={sureCheck} onChange={setSureCheck} />
          <Toggle label="Face icons for younger grades" detail={sureCheck ? 'Show face icons with the confidence choices (designed for Grades 1–2).' : 'Turn on Sure-Check to use face icons.'} checked={sureCheck && faces} onChange={setFaces} disabled={!sureCheck} />
        </div>
        {sureCheck && <div className="t-sure-preview" aria-label="Student preview">
          <span className="t-overline">Student preview</span>
          <div>{[{ label: 'Sure', icon: <Smile size={16} /> }, { label: 'Not sure', icon: <Meh size={16} /> }, { label: 'Guessed', icon: <CircleHelp size={16} /> }].map((option) => <span className="t-sure-chip" key={option.label}>{faces && <span aria-hidden="true">{option.icon}</span>}{option.label}</span>)}</div>
          {faces && <small className="t-hint">{className} is Grade 4. Face icons are designed for Grades 1–2.</small>}
        </div>}
      </Card>

      <div className="t-form-footer">
        <span>{rows.length} {rows.length === 1 ? 'question' : 'questions'} · {totalMarks} marks{submitted && summary.length > 0 ? ` · ${summary.length} to fix` : ''}</span>
        <div className="t-actions"><Button variant="secondary" onClick={cancel}>Cancel</Button><Button type="submit" icon={<Check size={15} />}>Save exam</Button></div>
      </div>
    </form>
    {confirmDiscard && <Modal title="Discard this exam?" description="The details you entered will not be saved." onClose={() => setConfirmDiscard(false)} footer={<><Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Keep editing</Button><Button variant="danger" onClick={() => setScreen('exams')}>Discard exam</Button></>} />}
  </>
}

/* ============================================================================
 * Verify extracted text — step 2 of the workflow.
 * Queue on the left, scan vs. OCR side by side on the right.
 * ========================================================================== */

function VerifyText({ exam, answers, update, setScreen, notify }: { exam: Exam; answers: Answer[]; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
  const [mode, setMode] = useState<'student' | 'question'>('student'); const [studentId, setStudentId] = useState('malak'); const [question, setQuestion] = useState(0); const [zoom, setZoom] = useState(1)
  const examQuestions = questionsForExam(exam.id, [exam])
  const examAnswers = answers.filter((item) => item.examId === exam.id)
  const selectedAnswers = mode === 'student' ? examAnswers.filter((item) => item.studentId === studentId) : examAnswers.filter((item) => item.q === question)
  const current = mode === 'student' ? selectedAnswers.find((item) => item.q === question) ?? selectedAnswers[0] : selectedAnswers.find((item) => item.studentId === studentId) ?? selectedAnswers[0]
  const studentName = person(current?.studentId ?? studentId).name
  const done = examAnswers.filter((item) => item.verified || item.unreadable).length
  const patchAnswer = (target: Answer, patch: Partial<Answer>) => update((data) => ({ ...data, answers: data.answers.map((item) => item.examId === target.examId && item.studentId === target.studentId && item.q === target.q ? { ...item, ...patch } : item) }))
  const markUnreadable = (target: Answer) => { patchAnswer(target, { unreadable: !target.unreadable, verified: !target.unreadable }); notify(target.unreadable ? 'Answer returned to text review.' : 'Marked unreadable. It will not receive an AI grade and needs manual grading.') }
  const confirmPaper = () => { update((data) => ({ ...data, answers: data.answers.map((item) => item.examId === exam.id && item.studentId === studentId ? { ...item, verified: true } : item), exams: data.exams.map((item) => item.id === exam.id ? { ...item, status: 'Awaiting confirmation' } : item) })); notify(`${person(studentId).name}’s text confirmed. Readable answers can now be graded.`) }
  const confirmQuestion = () => { update((data) => ({ ...data, answers: data.answers.map((item) => item.examId === exam.id && item.q === question ? { ...item, verified: true } : item), exams: data.exams.map((item) => item.id === exam.id ? { ...item, status: 'Awaiting confirmation' } : item) })); notify(`Question ${question + 1} text confirmed across the class.`) }
  const paperCount = exam.id === 'quiz-3' ? 6 : Math.ceil(examAnswers.length / 3)
  return <>
    <PageHeader crumbs={[examsCrumb(setScreen), { label: exam.title }, { label: 'Verify text' }]} title="Verify extracted text" description={`${exam.title} · ${done} of ${examAnswers.length} answers checked. OCR highlights uncertain words for review.`} actions={<><Button variant="ghost" onClick={() => setScreen('dashboard')}>Back to dashboard</Button><Button variant="secondary" onClick={() => setScreen('grades')}>Continue to grades <ArrowRight size={15} /></Button></>}>
      <WorkflowStepper current={1} compact />
    </PageHeader>

    <Card className="t-summary">
      <div className="t-summary-label"><span>Uploaded papers</span><strong>{paperCount} students</strong></div>
      <ProgressBar label="Answers checked" value={examAnswers.length ? done / examAnswers.length * 100 : 0} tone={done === examAnswers.length ? 'success' : 'accent'} />
      <Badge tone={done === examAnswers.length ? 'success' : 'warning'}>{done} / {examAnswers.length} answers checked</Badge>
    </Card>

    <div className="t-split">
      <Card padded={false} className="t-split-aside">
        <CardHeader title="Paper queue" action={<Badge>{examAnswers.length ? Math.ceil(examAnswers.length / 3) : 0}</Badge>} />
        <div className="t-list">{students.map((student) => {
          const rows = examAnswers.filter((item) => item.studentId === student.id); if (!rows.length) return null
          const checked = rows.filter((item) => item.verified || item.unreadable).length
          return <ListItem key={student.id} active={studentId === student.id && mode === 'student'} onClick={() => { setStudentId(student.id); setMode('student') }} leading={<Avatar name={student.name} />} title={student.name} subtitle={`3 answers · ${checked === 3 ? 'Verified' : checked ? `${checked} checked` : 'Needs text check'}`} trailing={<Badge tone={checked === 3 ? 'success' : 'warning'}>{checked === 3 ? 'Ready' : 'Review'}</Badge>} />
        })}</div>
      </Card>

      <Card padded={false} className="t-split-main">
        <CardHeader title={mode === 'student' ? `${studentName} · complete paper` : `${examQuestions[question]?.skill ?? 'Question'} · all students`} action={<Segmented label="Review mode" value={mode} onChange={setMode} options={[{ value: 'student', label: 'By student' }, { value: 'question', label: 'By question' }]} />} />
        {mode === 'question' && <div className="t-card-section"><Tabs label="Questions" value={question} onChange={setQuestion} options={examQuestions.map((item, index) => ({ value: index, label: `Q${index + 1} · ${item.skill}` }))} /></div>}
        {current ? <>
          <div className="t-review-toolbar">
            <div><strong>{mode === 'student' ? `Answer ${current.q + 1}` : `${studentName} · Q${current.q + 1}`}</strong><small>{examQuestions[current.q]?.prompt}</small></div>
            <div className="t-zoom" role="group" aria-label="Scan zoom">
              <button type="button" className="t-icon-btn" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(.8, value - .1))}><ZoomOut size={16} /></button>
              <span aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button type="button" className="t-icon-btn" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.5, value + .1))}><ZoomIn size={16} /></button>
            </div>
          </div>
          <div className="t-compare">
            <div className="t-scan-frame">
              <span className="t-overline">Scanned handwriting · page 2</span>
              <div className="t-scan" style={{ transform: `scale(${zoom})` }}><strong>{current.response}</strong><small>Handwritten response sample</small></div>
            </div>
            <div className="t-ocr">
              <div className="t-ocr-head"><span><ScanLine size={16} aria-hidden="true" /> Extracted text</span><Badge tone={current.unreadable ? 'danger' : current.verified ? 'success' : 'warning'} dot>{current.unreadable ? 'Unreadable · manual grade' : current.verified ? 'Confirmed' : 'Low confidence'}</Badge></div>
              <Alert tone="warning">Highlighted token has low OCR confidence (62%). Please compare with the scan.</Alert>
              <p className="t-token-preview" aria-label="Extracted text with uncertain token highlighted"><mark>{current.response.split(/\s+/)[0] ?? ''}</mark>{` ${current.response.split(/\s+/).slice(1).join(' ')}`}</p>
              <TextArea label="Edit extracted answer" rows={3} value={current.response} disabled={current.unreadable} onChange={(value) => patchAnswer(current, { response: value })} />
              <DescriptionList items={[{ term: 'Question', detail: examQuestions[current.q]?.prompt }, { term: 'Model answer', detail: examQuestions[current.q]?.expected }]} />
              <div className="t-actions">
                <Button variant="ghost" onClick={() => notify('Correction saved to this answer.')}>Save correction</Button>
                <Button variant="secondary" onClick={() => markUnreadable(current)}>{current.unreadable ? 'Restore answer' : 'Mark unreadable'}</Button>
                <Button variant="secondary" icon={<Check size={15} />} onClick={() => patchAnswer(current, { verified: true })} disabled={current.unreadable || current.verified}>{current.verified ? 'Text confirmed' : 'Confirm text'}</Button>
              </div>
            </div>
          </div>
          {mode === 'student' && <footer className="t-card-footer t-pager">
            <span>Answer {current.q + 1} of {selectedAnswers.length}</span>
            <div className="t-actions">
              <Button variant="ghost" icon={<ChevronLeft size={15} />} disabled={current.q === 0} onClick={() => setQuestion(Math.max(0, current.q - 1))}>Previous</Button>
              <Button variant="secondary" disabled={current.q >= selectedAnswers.length - 1} onClick={() => setQuestion(Math.min(selectedAnswers.length - 1, current.q + 1))}>Next answer <ChevronRight size={15} /></Button>
              <Button icon={<Check size={15} />} onClick={confirmPaper}>Confirm paper text</Button>
            </div>
          </footer>}
          {mode === 'question' && <footer className="t-card-footer t-pager">
            <span>Question {question + 1} of {examQuestions.length} · {selectedAnswers.filter((item) => item.verified || item.unreadable).length} checked</span>
            <Button icon={<Check size={15} />} onClick={confirmQuestion}>Confirm question for all</Button>
          </footer>}
        </> : <EmptyState icon={<FileText size={20} />} title="No uploaded answers for this exam yet." description="Choose an exam with submitted papers." action={<Button variant="secondary" onClick={() => setScreen('exams')}>Go to exams</Button>} />}
      </Card>
    </div>
  </>
}

/* ============================================================================
 * Confirm AI grades — step 3 of the workflow.
 * ========================================================================== */

function GradeReview({ exam, answers, data, update, setScreen, notify, setExam }: { exam: Exam; answers: Answer[]; data: Data; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void; setExam: (id: string) => void }) {
  const [filter, setFilter] = useState<'priority' | 'all' | 'groups'>('priority'); const [question, setQuestion] = useState(0); const [editing, setEditing] = useState<string | null>(null); const [draftScore, setDraftScore] = useState(''); const [reason, setReason] = useState(''); const [language, setLanguage] = useState<'English' | 'German'>('English'); const [releaseConfirm, setReleaseConfirm] = useState(false); const [editModel, setEditModel] = useState(false); const [modelDraft, setModelDraft] = useState(exam.modelText)
  useEffect(() => setModelDraft(exam.modelText), [exam.id, exam.modelText])
  const examQuestions = questionsForExam(exam.id, data.exams); const examAnswers = answers.filter((item) => item.examId === exam.id && item.q === question && item.verified)
  const ordered = [...examAnswers].sort((a, b) => (a.state === 'Surprise mistake' ? -1 : 0) - (b.state === 'Surprise mistake' ? -1 : 0))
  const shown = filter === 'priority' ? ordered.filter((item) => item.state === 'Surprise mistake' || item.unreadable) : ordered
  const allExamAnswers = answers.filter((item) => item.examId === exam.id && item.verified)
  const totals = students.map((student) => ({ student, total: answers.filter((item) => item.examId === exam.id && item.studentId === student.id && item.verified && item.confirmed).reduce((sum, item) => sum + item.score, 0) }))
  const possible = examQuestions.reduce((sum, item) => sum + item.max, 0); const average = totals.length ? (totals.reduce((sum, item) => sum + item.total, 0) / totals.length).toFixed(1) : '0.0'; const passRate = totals.length ? Math.round(totals.filter((item) => item.total >= possible * .6).length / totals.length * 100) : 0
  const agreementItems = allExamAnswers.filter((item) => item.confirmed && !item.unreadable); const agreement = agreementItems.length ? Math.round(agreementItems.filter((item) => !item.overrideReason).length / agreementItems.length * 100) : 0
  const patchAnswer = (target: Answer, patch: Partial<Answer>) => update((current) => ({ ...current, answers: current.answers.map((item) => item.examId === target.examId && item.studentId === target.studentId && item.q === target.q ? { ...item, ...patch } : item) }))
  const saveModelAndRegrade = () => { if (!modelDraft.trim()) return; const overridden = answers.filter((item) => item.examId === exam.id && item.overrideReason).map((item) => person(item.studentId).name); const criteria = parseModelCriteria(modelDraft); update((current) => ({ ...current, exams: current.exams.map((item) => item.id === exam.id ? { ...item, modelText: modelDraft.trim(), questions: questionsForExam(item.id, current.exams).map((question, index) => ({ ...question, expected: criteria[index] ?? question.expected })) } : item), answers: current.answers.map((answer) => { if (answer.examId !== exam.id || !answer.verified || answer.confirmed || answer.overrideReason || answer.unreadable) return answer; const expected = criteria[answer.q] ?? ''; if (!expected) return answer; const terms = [...new Set(expected.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])].filter((term) => term.length > 1); const responseTerms = new Set(answer.response.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []); const matchedTerms = terms.filter((term) => responseTerms.has(term)); const missedTerms = terms.filter((term) => !responseTerms.has(term)); const score = terms.length ? Math.min(answer.max, Math.round((matchedTerms.length / terms.length) * answer.max)) : answer.ai; const sure = answer.sure; const correct = score >= answer.max * .75; const state = correct ? sure === 'Sure' ? 'Secure' : 'Wobbly' : sure === 'Sure' ? 'Surprise mistake' : 'Known gap'; return { ...answer, ai: score, score, confirmed: false, state, cause: correct ? 'No issue' : answer.cause, matched: matchedTerms.length ? matchedTerms.join(', ') : 'No model-answer criteria matched', missed: missedTerms.length ? missedTerms.join(', ') : 'Nothing missed' } }), regradeChecks: [...new Set([...current.regradeChecks, ...overridden])] })); setEditModel(false); notify(`Regrade complete for ${answers.filter((item) => item.examId === exam.id && item.verified && !item.unreadable && !item.confirmed && !item.overrideReason).length} unconfirmed answers. Teacher-confirmed and overridden grades were preserved and flagged for a second check.`) }
  const confirm = (target: Answer) => { patchAnswer(target, { confirmed: true, score: target.ai, overrideReason: '' }); notify(`AI grade confirmed for ${person(target.studentId).name}.`) }
  const saveOverride = (target: Answer) => { if (!reason.trim() || !draftScore || Number(draftScore) < 0 || Number(draftScore) > target.max) return; patchAnswer(target, { score: Number(draftScore), confirmed: true, overrideReason: reason.trim() }); setEditing(null); setReason(''); notify('Teacher grade saved. This answer will appear in the second-check list after regrading.') }
  const confirmGroup = (group: Answer[]) => { const pending = group.filter((item) => !item.confirmed); update((current) => ({ ...current, answers: current.answers.map((answer) => group.some((item) => item.studentId === answer.studentId && item.q === answer.q) && answer.examId === exam.id && !answer.confirmed ? { ...answer, score: answer.ai, confirmed: true, overrideReason: '' } : answer) })); notify(`${pending.length} unconfirmed matching answers confirmed. Existing teacher decisions were preserved.`) }
  const groups = useMemo(() => { const map = new Map<string, Answer[]>(); for (const answer of examAnswers.filter((item) => !item.unreadable)) map.set(answer.response.trim().toLowerCase(), [...(map.get(answer.response.trim().toLowerCase()) ?? []), answer]); return [...map.values()].filter((group) => group.length > 1) }, [examAnswers])
  const release = () => { const pending = answers.filter((item) => item.examId === exam.id && (!item.verified || !item.confirmed)); if (pending.length) { notify(`${pending.length} answers still need text verification and teacher grading before release.`); setReleaseConfirm(false); return } update((current) => ({ ...current, exams: current.exams.map((item) => item.id === exam.id ? { ...item, released: true, status: 'Released' } : item) })); setReleaseConfirm(false); notify('Confirmed grades released. Students have been notified.') }
  const exportCsv = () => { const rows = [['Student', 'Exam', 'Total', 'State', 'Cause', 'Teacher confirmed'], ...totals.map(({ student, total }) => [student.name, exam.title, `${total} / ${possible}`, answers.find((item) => item.examId === exam.id && item.studentId === student.id && item.q === question)?.state ?? '', answers.find((item) => item.examId === exam.id && item.studentId === student.id && item.q === question)?.cause ?? '', answers.find((item) => item.examId === exam.id && item.studentId === student.id && item.q === question)?.confirmed ? 'Yes' : 'No'])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.href = url; link.download = `${exam.id}-final-grades.csv`; link.click(); URL.revokeObjectURL(url); notify('Final grade spreadsheet downloaded.') }
  const copyGrades = <><Button variant="secondary" icon={<Download size={15} />} onClick={exportCsv}>Export grades</Button><Button icon={<Send size={15} />} onClick={() => setReleaseConfirm(true)} disabled={exam.released}>{exam.released ? 'Results released' : 'Release confirmed results'}</Button></>
  return <>
    <PageHeader crumbs={[examsCrumb(setScreen), { label: exam.title }, { label: 'Confirm grades' }]} title="Confirm AI grades" description={`${exam.title} · ${allExamAnswers.length} readable answers · teacher decisions are final.`} actions={copyGrades}>
      <WorkflowStepper current={exam.released ? 3 : 2} compact />
    </PageHeader>

    <Card className="t-grade-toolbar">
      <div className="t-grade-exam">
        <SelectField label="Exam" value={exam.id} options={data.exams.map((item) => ({ value: item.id, label: item.title }))} onChange={setExam} />
        <div className="t-criteria"><span className="t-overline">Model criteria</span><p>{exam.modelText || 'Set the approved model answer in exam setup.'}</p><Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => setEditModel(true)}>Edit model answer & regrade</Button></div>
      </div>
      <div className="t-metric"><span className="t-row-icon" aria-hidden="true"><Sparkles size={18} /></span><div><strong>{agreement}%</strong><span>AI agreement</span><small>Confirmed without modification</small></div></div>
    </Card>

    <div className="t-toolbar">
      <Tabs label="Questions" value={question} onChange={setQuestion} options={examQuestions.map((item, index) => ({ value: index, label: `Q${index + 1} · ${item.skill}`, meta: `${answers.filter((answer) => answer.examId === exam.id && answer.q === index && answer.confirmed).length}/${students.length} confirmed` }))} />
      <Segmented label="Filter answers" value={filter} onChange={setFilter} options={[{ value: 'priority', label: <><AlertTriangle size={14} aria-hidden="true" />Surprise first</> }, { value: 'all', label: 'All answers' }, { value: 'groups', label: 'Group similar' }]} />
    </div>

    <Card padded={false} className="t-grade-list">
      {filter === 'groups'
        ? groups.length ? groups.map((group, index) => <div className="t-group-row" key={index}>
            <div><Badge>{group.length} matching answers</Badge><p className="t-quote">{group[0].response}</p><small>{group.map((item) => person(item.studentId).name).join(', ')}</small></div>
            <span className="t-score-chip">{group[0].score} / {group[0].max} each</span>
            <Button variant="secondary" size="sm" icon={<Check size={14} />} onClick={() => confirmGroup(group)}>Confirm group</Button>
          </div>) : <EmptyState title="No matching answers in this question." />
        : shown.length ? shown.map((item) => item.unreadable
          ? <ManualGradeCard key={`${item.studentId}-${item.q}`} answer={item} question={examQuestions[question]} onSave={(score, note) => { patchAnswer(item, { score, ai: 0, confirmed: true, overrideReason: note, state: 'Wobbly', cause: 'Unclear OCR reading', matched: 'Manually scored by teacher', missed: 'No automated grade was generated.', feedbackEn: 'Your answer was unreadable and has been graded by your teacher.' }); notify(`Manual grade saved for ${person(item.studentId).name}.`) }} />
          : <GradeCard key={`${item.studentId}-${item.q}`} answer={item} question={examQuestions[question]} language={language} setLanguage={setLanguage} onConfirm={() => confirm(item)} onEdit={() => { setEditing(`${item.studentId}-${item.q}`); setDraftScore(String(item.score)); setReason('') }} onPatch={(patch) => patchAnswer(item, patch)} editing={editing === `${item.studentId}-${item.q}`} draftScore={draftScore} setDraftScore={setDraftScore} reason={reason} setReason={setReason} onSaveOverride={() => saveOverride(item)} onCancel={() => setEditing(null)} />)
          : <EmptyState icon={<Check size={20} />} title="No surprise mistakes waiting." description="Switch to All answers to review other responses." action={<Button variant="secondary" onClick={() => setFilter('all')}>Show all answers</Button>} />}
    </Card>

    <h2 className="t-section-title">Results summary</h2>
    <div className="t-grid t-grid-summary">
      <StatCard label="Class average" value={`${average} / ${possible}`} detail="Calculated from current teacher scores" icon={<Users size={18} />} />
      <StatCard label="Pass rate" value={`${passRate}%`} detail="60% or higher" icon={<Check size={18} />} />
      <Card padded={false}>
        <CardHeader title="Student totals" />
        <ul className="t-kv-list">{totals.map(({ student, total }) => <li key={student.id}><span>{student.name}</span><strong>{total} / {possible}</strong></li>)}</ul>
      </Card>
      <Card padded={false}>
        <CardHeader title="Second check" description="Teacher-overridden grades awaiting review" action={<Badge tone={data.regradeChecks.length ? 'warning' : 'neutral'}>{data.regradeChecks.length}</Badge>} />
        {data.regradeChecks.length ? <ul className="t-kv-list">{data.regradeChecks.map((name) => <li key={name}><span>{name}</span></li>)}</ul> : <EmptyState title="Nothing to re-check." />}
      </Card>
    </div>

    {releaseConfirm && <Modal title="Release confirmed results?" description="Students will be notified. Every answer must be text-verified and teacher-graded before results can be released." onClose={() => setReleaseConfirm(false)} footer={<><Button variant="secondary" onClick={() => setReleaseConfirm(false)}>Cancel</Button><Button icon={<Send size={15} />} onClick={release}>Release results</Button></>} />}
    {editModel && <Modal title="Edit model answer and regrade" description="Verified, readable answers will be regraded against these criteria. Existing teacher overrides stay unchanged and are added to the second-check list." onClose={() => { setEditModel(false); setModelDraft(exam.modelText) }} footer={<><Button variant="secondary" onClick={() => { setEditModel(false); setModelDraft(exam.modelText) }}>Cancel</Button><Button icon={<Sparkles size={15} />} onClick={saveModelAndRegrade} disabled={!modelDraft.trim()}>Save and regrade</Button></>}>
      <TextArea label="Approved answer key" rows={8} value={modelDraft} onChange={setModelDraft} />
    </Modal>}
  </>
}

/** Disclosure that explains the four understanding states on demand. */
function StateGuide() {
  return <details className="t-disclosure"><summary><CircleHelp size={14} aria-hidden="true" /> What do the states mean?</summary><p>{stateHelp}</p></details>
}

function GradeCard({ answer, question, language, setLanguage, onConfirm, onEdit, onPatch, editing, draftScore, setDraftScore, reason, setReason, onSaveOverride, onCancel }: { answer: Answer; question: { prompt: string; skill: string; max: number; expected: string }; language: 'English' | 'German'; setLanguage: (value: 'English' | 'German') => void; onConfirm: () => void; onEdit: () => void; onPatch: (patch: Partial<Answer>) => void; editing: boolean; draftScore: string; setDraftScore: (value: string) => void; reason: string; setReason: (value: string) => void; onSaveOverride: () => void; onCancel: () => void }) {
  const name = person(answer.studentId).name
  return <article className={cx('t-grade', answer.state === 'Surprise mistake' && 'is-priority')}>
    <header className="t-grade-head">
      <Avatar name={name} />
      <div className="t-grade-who"><strong>{name}</strong><small>Q{answer.q + 1} · {question.skill} · Sure-Check: {answer.sure}</small></div>
      <div className="t-badges"><Badge tone={stateTone(answer.state)} dot>{answer.state}</Badge>{answer.confirmed && <Badge tone="success">Teacher confirmed</Badge>}</div>
      <div className="t-score"><strong>{answer.overrideReason ? answer.score : answer.ai}<span>/{answer.max}</span></strong><small>{answer.overrideReason ? 'Teacher grade' : 'AI suggestion'}</small></div>
    </header>

    <div className="t-grade-body">
      <div className="t-grade-evidence">
        <span className="t-overline">Student answer</span>
        <p className="t-quote">{answer.response}</p>
        <ul className="t-evidence">
          <li className="is-match"><Check size={15} aria-hidden="true" /><span><strong>Matched</strong>{answer.matched}</span></li>
          <li className="is-miss"><X size={15} aria-hidden="true" /><span><strong>Needs attention</strong>{answer.missed}</span></li>
        </ul>
        <small className="t-muted">Model answer: {question.expected}</small>
      </div>
      <div className="t-grade-classify">
        <SelectField label="Understanding state" value={answer.state} options={['Secure', 'Wobbly', 'Known gap', 'Surprise mistake']} onChange={(value) => onPatch({ state: value })} />
        <SelectField label="Suggested cause" value={answer.cause} options={['Concept error', 'Language error', 'Careless slip', 'Unclear OCR reading', 'No issue']} onChange={(value) => { const terms = languageTermsByQuestion[answer.q] ?? languageTermsByQuestion[0]; onPatch(value === 'Language error' ? { cause: value, germanKeyword: answer.germanKeyword || terms.german, englishTranslation: answer.englishTranslation || terms.english } : { cause: value }) }} />
        <StateGuide />
      </div>
    </div>

    {editing && <div className="t-inset" role="group" aria-label={`Override ${name}'s grade`}>
      <div className="t-inset-grid">
        <TextField label={`Final grade (0–${answer.max})`} type="number" min={0} max={answer.max} value={draftScore} onChange={setDraftScore} />
        <TextField label="Reason for override" value={reason} onChange={setReason} required hint="Required. Kept with the grade for the second check." />
      </div>
      <div className="t-actions"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button onClick={onSaveOverride} disabled={!reason.trim() || !draftScore || Number(draftScore) < 0 || Number(draftScore) > answer.max}>Save teacher grade</Button></div>
    </div>}

    <div className="t-feedback">
      <div className="t-feedback-head"><strong><MessageSquare size={15} aria-hidden="true" /> Suggested feedback</strong><Segmented label="Feedback language" value={language} onChange={setLanguage} options={[{ value: 'English', label: 'English' }, { value: 'German', label: 'Deutsch' }]} /></div>
      <TextArea rows={2} ariaLabel={`Feedback for ${name}`} value={language === 'English' ? answer.feedbackEn : answer.feedbackDe} onChange={(value) => onPatch(language === 'English' ? { feedbackEn: value } : { feedbackDe: value })} />
      <div className="t-feedback-actions">
        <Button variant="ghost" size="sm" onClick={() => onPatch(language === 'English' ? { feedbackEn: 'Try comparing the numerators when denominators match.' } : { feedbackDe: 'Vergleiche die Zähler, wenn die Nenner gleich sind.' })}>Accept suggestion</Button>
        {answer.cause === 'Language error' && <div className="t-inset-grid"><TextField label="German keyword" value={answer.germanKeyword} onChange={(value) => onPatch({ germanKeyword: value })} /><TextField label="English translation" value={answer.englishTranslation} onChange={(value) => onPatch({ englishTranslation: value })} /></div>}
      </div>
    </div>

    <footer className="t-grade-foot">
      {answer.overrideReason ? <Badge tone="warning">Teacher grade: {answer.score}/{answer.max} · {answer.overrideReason}</Badge> : <span />}
      <div className="t-actions">
        <Button variant="secondary" icon={<Pencil size={14} />} onClick={onEdit}>Override grade</Button>
        <Button icon={<Check size={15} />} onClick={onConfirm} disabled={answer.confirmed && !answer.overrideReason}>{answer.confirmed && !answer.overrideReason ? 'Grade confirmed' : 'Confirm AI grade'}</Button>
      </div>
    </footer>
  </article>
}

function ManualGradeCard({ answer, question, onSave }: { answer: Answer; question: { prompt: string; skill: string; max: number; expected: string }; onSave: (score: number, reason: string) => void }) {
  const [score, setScore] = useState(''); const [reason, setReason] = useState('')
  const name = person(answer.studentId).name
  return <article className="t-grade is-manual">
    <header className="t-grade-head">
      <Avatar name={name} />
      <div className="t-grade-who"><strong>{name}</strong><small>Q{answer.q + 1} · {question.skill}</small></div>
      <div className="t-badges"><Badge tone="danger" dot>Manual grading required</Badge></div>
    </header>
    <Alert tone="warning">OCR confidence was too low. No AI score was generated; review the original scan before grading.</Alert>
    <div className="t-grade-evidence"><span className="t-overline">Recognized text</span><p className="t-quote">{answer.response || 'No reliable text detected'}</p></div>
    <div className="t-inset">
      <div className="t-inset-grid">
        <TextField label={`Teacher score (0–${answer.max})`} type="number" min={0} max={answer.max} value={score} onChange={setScore} />
        <TextField label="Reason for manual grade" value={reason} onChange={setReason} required hint="Required." />
      </div>
      <div className="t-actions"><Button icon={<Check size={15} />} disabled={!reason.trim() || !score || Number(score) < 0 || Number(score) > answer.max} onClick={() => onSave(Number(score), reason.trim())}>Save manual grade</Button></div>
    </div>
  </article>
}

/* ============================================================================
 * Learning gaps & red flags.
 * ========================================================================== */

function LearningGaps({ data, update, setScreen, notify }: { data: Data; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
  const [examId, setExamId] = useState('quiz-3'); const [dismissId, setDismissId] = useState<string | null>(null); const [dismissComment, setDismissComment] = useState(''); const [reteachSkill, setReteachSkill] = useState('Comparing Fractions'); const [sent, setSent] = useState(false)
  const exam = data.exams.find((item) => item.id === examId) ?? data.exams[0]
  const examAnswers = data.answers.filter((item) => item.examId === exam.id)
  const sureWrong = (skill: string) => examAnswers.filter((item) => item.q === questionsForExam(exam.id, data.exams).findIndex((question) => question.skill === skill) && item.verified && item.confirmed && item.sure === 'Sure' && item.score < item.max).length
  const skills = [...new Set([...questionsForExam(exam.id, data.exams).map((item) => item.skill), 'Word Problems'])]
  const actionFlag = (id: string, status: 'Confirmed' | 'Dismissed', comment = '') => { update((current) => ({ ...current, flags: current.flags.map((item) => item.id === id ? { ...item, status, comment } : item) })); setDismissId(null); setDismissComment(''); notify(status === 'Confirmed' ? 'Red flag confirmed. This support note is now visible to the student and parent.' : 'Red flag dismissed. It will not be shown to the student or parent.') }
  const concepts = skills.map((skill) => ({ skill, concept: data.answers.filter((item) => questionsForExam(item.examId, data.exams)[item.q]?.skill === skill && item.confirmed && item.cause === 'Concept error').length, language: data.answers.filter((item) => questionsForExam(item.examId, data.exams)[item.q]?.skill === skill && item.confirmed && item.cause === 'Language error').length }))
  const exerciseBank: Record<string, string[]> = { 'Comparing Fractions': ['Compare 3/4 and 2/3. Which is larger?', 'Make the bottom numbers the same for 2/5 and 3/5.', 'Explain why 3/5 is larger than 2/5.'], 'Equivalent Fractions': ['Write an equivalent fraction for 1/2.', 'Complete: 2/4 = __ / 8.', 'Circle the fraction equal to 3/6.'], 'Adding Fractions': ['Add 2/8 and 3/8.', 'What is 5/8 + 1/8?', 'Draw a picture to show 1/4 + 2/4.'], 'Word Problems': ['Read the question and circle the numbers you need.', 'Choose whether to add or subtract.', 'Write one sentence to explain your answer.'], 'Animal Habitats': ['Name one thing an animal needs from its habitat.', 'Match an animal to its home.', 'Draw a habitat with food, water, and shelter.'] }
  const sendPractice = () => {
    const exercises = exerciseBank[reteachSkill] ?? [`Try one example about ${reteachSkill}.`, `Explain how you solved a ${reteachSkill.toLowerCase()} question.`]
    const sentAt = Date.now()
    update((current) => ({ ...current, practiceAssignments: [...(current.practiceAssignments ?? []), ...students.map((student) => ({ id: `practice-${sentAt}-${student.id}`, studentId: student.id, skill: reteachSkill, exercises }))] }))
    setSent(true)
    notify(`Practice for ${reteachSkill} sent to the whole class.`)
  }
  const [groupMessage, setGroupMessage] = useState('')
  const groupTargets = students.filter((student) => data.answers.some((answer) => answer.studentId === student.id && answer.confirmed && answer.cause === 'Concept error' && questionsForExam(answer.examId, data.exams)[answer.q]?.skill === reteachSkill))
  const sendGroupMessage = () => { if (!groupMessage.trim() || !groupTargets.length) return; update((current) => ({ ...current, sent: [...current.sent, ...groupTargets.map((student) => `${student.id}: ${groupMessage.trim()}`)] })); notify(`Supportive message sent to ${groupTargets.length} students with a confirmed ${reteachSkill} learning gap.`); setGroupMessage('') }
  const pendingFlags = data.flags.filter((item) => item.status === 'Pending').length
  return <>
    <PageHeader title="Learning gaps & red flags" description="Separate conceptual misunderstandings from language difficulties, then plan the right support." actions={<Button variant="secondary" icon={<Users size={15} />} onClick={() => setScreen('profile')}>Student profiles</Button>} />

    <Card padded={false}>
      <CardHeader title="Class misconception map" description="Confidently incorrect answers: Sure-Check marked Sure and the answer was incorrect. Select a concept to plan support." action={<div className="t-header-select"><SelectField label="Exam" value={exam.title} options={data.exams.map((item) => item.title)} onChange={(value) => setExamId(data.exams.find((item) => item.title === value)?.id ?? 'quiz-3')} /></div>} />
      <div className="t-map">{skills.map((skill, index) => {
        const count = sureWrong(skill)
        return <button type="button" key={skill} className={cx('t-map-row', reteachSkill === skill && 'is-active')} aria-pressed={reteachSkill === skill} onClick={() => setReteachSkill(skill)}>
          <span className="t-map-q">Q{index + 1}</span>
          <span className="t-map-label"><strong>{skill}</strong><small>{count > 1 ? 'Class concept to reteach' : 'Answers needing teacher review'}</small></span>
          <span className="t-map-bar" aria-hidden="true"><i style={{ width: `${Math.max(count ? 12 : 2, count / students.length * 100)}%` }} /></span>
          <Badge tone={count > 1 ? 'warning' : 'neutral'}>{count} students</Badge>
        </button>
      })}</div>
      <footer className="t-card-footer t-plan">
        <div><span className="t-overline">Class support plan · Class 4B</span><strong>{reteachSkill}</strong></div>
        <div className="t-actions"><Button variant="secondary" icon={<Check size={15} />} onClick={() => { notify(`${reteachSkill} added to the class reteach plan.`) }}>Plan to reteach</Button><Button icon={<Send size={15} />} onClick={sendPractice}>{sent ? 'Practice sent' : 'Send practice to class'}</Button></div>
      </footer>
    </Card>

    <Card>
      <CardHeader title="Message students with this learning gap" description={`${groupTargets.length} students have a confirmed ${reteachSkill} concept error across assessments.`} />
      <TextArea label="Supportive message" rows={3} value={groupMessage} onChange={setGroupMessage} placeholder="Share a reassuring note and one next step." />
      <div className="t-actions t-actions-end"><Button icon={<Send size={15} />} onClick={sendGroupMessage} disabled={!groupMessage.trim() || !groupTargets.length}>Send to learning-gap group</Button></div>
    </Card>

    <div className="t-grid t-grid-2">
      <Card padded={false}>
        <CardHeader title="Concept vs. language" description="Only teacher-confirmed concept errors count toward learning gaps. Language errors are tracked separately." />
        <ul className="t-rows">{concepts.map((item) => <li className="t-split-row" key={item.skill}>
          <strong>{item.skill}</strong>
          <span className="t-badges"><Badge tone={item.concept ? 'warning' : 'neutral'}>{item.concept} concept</Badge><Badge>{item.language} language</Badge></span>
          <LinkButton onClick={() => { setScreen('profile') }}>View students <ChevronRight size={14} /></LinkButton>
        </li>)}</ul>
      </Card>
      <Card padded={false}>
        <CardHeader title="Red flag list" description="Flags require repeated Surprise mistakes or Known gaps across exams, not a single low grade." action={<Badge tone={pendingFlags ? 'warning' : 'neutral'}>{pendingFlags} pending</Badge>} />
        <ul className="t-rows">{data.flags.map((flag) => <li className="t-flag" key={flag.id}>
          <div className="t-flag-head"><span className="t-row-icon t-row-icon-warning" aria-hidden="true"><Flag size={15} /></span><strong>{person(flag.studentId).name} · {flag.skill}</strong><Badge tone={flag.status === 'Confirmed' ? 'success' : flag.status === 'Dismissed' ? 'neutral' : 'warning'} dot>{flag.status}</Badge></div>
          <p>{flag.reason}</p>
          <small className="t-muted">Answers: {flag.answers}</small>
          {flag.status === 'Pending'
            ? <div className="t-actions"><Button variant="secondary" size="sm" onClick={() => setDismissId(dismissId === flag.id ? null : flag.id)}>Dismiss</Button><Button size="sm" icon={<Check size={14} />} onClick={() => actionFlag(flag.id, 'Confirmed')}>Confirm flag</Button></div>
            : flag.status === 'Confirmed' ? <small className="t-note t-note-success"><Eye size={13} aria-hidden="true" /> Confirmed support need · visible to student and parent</small>
            : <small className="t-note"><Lock size={13} aria-hidden="true" /> Dismissed privately: {flag.comment || 'No comment added'}</small>}
          {dismissId === flag.id && <div className="t-inset">
            <TextField label="Short dismissal comment" value={dismissComment} onChange={setDismissComment} required hint="Private. Not shown to the student or parent." />
            <div className="t-actions"><Button variant="secondary" size="sm" onClick={() => setDismissId(null)}>Cancel</Button><Button variant="danger" size="sm" onClick={() => dismissComment.trim() && actionFlag(flag.id, 'Dismissed', dismissComment.trim())} disabled={!dismissComment.trim()}>Save dismissal</Button></div>
          </div>}
        </li>)}</ul>
      </Card>
    </div>

    <Card padded={false}>
      <CardHeader title="Recurring mistakes by student" action={<LinkButton onClick={() => setScreen('profile')}>Open student profile <ArrowRight size={14} /></LinkButton>} />
      <div className="t-list">{students.slice(0, 4).map((student) => <ListItem key={student.id} onClick={() => setScreen('profile')} leading={<Avatar name={student.name} />} title={student.name} subtitle="Compare fractions · Math Quiz 2 and Math Quiz 3 · repeated confident error" trailing={<ChevronRight size={16} />} />)}</div>
    </Card>
  </>
}

/* ============================================================================
 * Student profile — roster on the left, private teacher view on the right.
 * ========================================================================== */

function StudentProfile({ data, update, setScreen, notify }: { data: Data; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
  const [studentId, setStudentId] = useState('malak'); const [draft, setDraft] = useState(data.notes.malak ?? ''); const [comment, setComment] = useState('')
  const student = person(studentId); const ownAnswers = data.answers.filter((item) => item.studentId === studentId); const conceptErrors = ownAnswers.filter((item) => item.confirmed && item.cause === 'Concept error'); const repeatedSkills = [...new Set(conceptErrors.map((item) => item.examId + item.q))]
  const saveNote = () => { update((current) => ({ ...current, notes: { ...current.notes, [studentId]: draft } })); notify('Private teacher note saved. Students and parents cannot see this note.') }
  const sendFeedback = () => { if (!comment.trim()) { notify('Write a short comment before sending feedback.'); return }; update((current) => ({ ...current, sent: [...current.sent, `${studentId}: ${comment.trim()}`] })); setComment(''); notify(`Feedback sent to ${student.name}.`) }
  return <>
    <PageHeader crumbs={[{ label: 'Learning gaps', onClick: () => setScreen('gaps') }, { label: 'Student profile' }]} title={student.name} description="Private teacher view · Class 4B · Math" actions={<Button icon={<Send size={15} />} onClick={sendFeedback}>Send feedback</Button>} />
    <div className="t-split">
      <Card padded={false} className="t-split-aside">
        <CardHeader title="Class 4B" action={<Badge>6 students</Badge>} />
        <div className="t-list">{students.map((item) => <ListItem key={item.id} active={studentId === item.id} onClick={() => { setStudentId(item.id); setDraft(data.notes[item.id] ?? '') }} leading={<Avatar name={item.name} />} title={item.name} subtitle="Grade 4 · Math" />)}</div>
      </Card>

      <div className="t-stack">
        <Card className="t-profile-hero">
          <Avatar name={student.name} size="lg" />
          <div><span className="t-overline">Grade 4B · Student profile</span><h2>{student.name}</h2><p>Grades, skill states and recurring mistakes across assessments.</p></div>
        </Card>

        <div className="t-grid t-grid-2">
          <Card padded={false}>
            <CardHeader title="Progress across exams" description="Grade history" />
            <ul className="t-rows">{data.exams.map((exam) => {
              const rows = data.answers.filter((item) => item.examId === exam.id && item.studentId === studentId && item.verified && item.confirmed); const total = rows.reduce((sum, item) => sum + item.score, 0); const max = rows.reduce((sum, item) => sum + item.max, 0)
              return <li className="t-history-row" key={exam.id}><span>{exam.title}</span><ProgressBar label={`${exam.title} score`} value={max ? total / max * 100 : 0} /><strong>{rows.length ? `${total} / ${max}` : exam.released ? 'No result' : 'In review'}</strong></li>
            })}</ul>
          </Card>
          <Card padded={false}>
            <CardHeader title="Understanding by skill" description="Skill states" />
            <ul className="t-rows">{[...new Set(ownAnswers.map((item) => questionsForExam(item.examId, data.exams)[item.q]?.skill).filter(Boolean))].map((skill) => {
              const matching = ownAnswers.filter((item) => questionsForExam(item.examId, data.exams)[item.q]?.skill === skill); const state = matching.some((item) => item.state === 'Surprise mistake') ? 'Surprise mistake' : matching.some((item) => item.state === 'Known gap') ? 'Known gap' : matching.some((item) => item.state === 'Wobbly') ? 'Wobbly' : 'Secure'; const examples = matching.map((item) => `${data.exams.find((exam) => exam.id === item.examId)?.title} · Q${item.q + 1}`).join('; ')
              return <li className="t-skill-row" key={skill}><div><strong>{skill}</strong><small>{examples}</small></div><div className="t-skill-meta"><Badge tone={stateTone(state)} dot>{state}</Badge><small>{matching.filter((item) => item.confirmed && item.cause === 'Concept error').length} concept · {matching.filter((item) => item.confirmed && item.cause === 'Language error').length} language</small></div></li>
            })}</ul>
          </Card>
        </div>

        <Card padded={false}>
          <CardHeader title="Patterns across exams" description="Recurring mistakes" action={<Badge>Grouped by skill</Badge>} />
          {repeatedSkills.length ? <div className="t-list">{conceptErrors.map((item) => <ListItem key={`${item.examId}-${item.q}`} leading={<span className="t-row-icon t-row-icon-warning" aria-hidden="true"><AlertTriangle size={16} /></span>} title={`${questionsForExam(item.examId, data.exams)[item.q]?.skill}: review the comparison rule`} subtitle={`${data.exams.find((exam) => exam.id === item.examId)?.title} · Q${item.q + 1} · confirmed concept error`} />)}</div>
            : <EmptyState title="No confirmed conceptual recurring mistakes yet." description="Language difficulties remain separate from learning gaps." />}
        </Card>

        <div className="t-grid t-grid-2">
          <Card>
            <CardHeader title="Teacher notes" description="Only teachers can see saved notes. These never appear in student or parent views." action={<Badge><Lock size={12} aria-hidden="true" /> Private</Badge>} />
            <TextArea label="Private note" rows={4} value={draft} onChange={setDraft} placeholder="What support does this student need?" />
            <div className="t-actions"><Button variant="secondary" icon={<Check size={15} />} onClick={saveNote}>Save private note</Button></div>
            {data.notes[studentId] && <p className="t-saved"><StickyNote size={14} aria-hidden="true" /> Saved note: {data.notes[studentId]}</p>}
          </Card>
          <Card>
            <CardHeader title="Send feedback" description="Individual support sent to the student." />
            <TextArea label={`Comment for ${student.name}`} rows={3} value={comment} onChange={setComment} placeholder="Write an encouraging, specific note." />
            <div className="t-field"><label htmlFor="profile-practice">Practice recommendation</label><select id="profile-practice" className="t-input t-select"><option>Comparing fractions · 5 questions</option><option>Equivalent fractions · 5 questions</option><option>Adding fractions · 5 questions</option><option>Word problems · 5 questions</option></select></div>
            <div className="t-actions"><Button icon={<Send size={15} />} onClick={sendFeedback}>Send comment and practice</Button></div>
          </Card>
        </div>
      </div>
    </div>
  </>
}

/* ============================================================================
 * Help requests — private inbox (list / detail).
 * ========================================================================== */

function HelpInbox({ data, update, setScreen, notify }: { data: Data; update: (fn: (current: Data) => Data) => void; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
  const [selected, setSelected] = useState(data.help[0]?.id ?? ''); const [slot, setSlot] = useState('Tuesday, November 17 · 3:30 PM'); const [message, setMessage] = useState(''); const [practice, setPractice] = useState('Comparing fractions · 5 questions')
  const request = data.help.find((item) => item.id === selected) ?? data.help[0]
  const occupiedSlots = new Set(data.help.filter((item) => item.id !== request?.id && item.booking).map((item) => item.booking)); const availableSlots = ['Tuesday, November 17 · 3:30 PM', 'Wednesday, November 18 · 2:00 PM', 'Thursday, November 19 · 3:00 PM'].filter((item) => !occupiedSlots.has(item)); const book = () => { if (!request || occupiedSlots.has(slot)) { notify('That office-hour slot is no longer available. Choose another time.'); return }; update((current) => ({ ...current, help: current.help.map((item) => item.id === request.id ? { ...item, status: 'Office hour booked', booking: slot } : item), sent: message.trim() ? [...current.sent, `${request.studentId}: ${message.trim()}`] : current.sent })); setMessage(''); notify(`Office hour booked for ${person(request.studentId).name} on ${slot}. The student has been notified.`) }
  const sendPractice = () => { if (!request) return; update((current) => ({ ...current, help: current.help.map((item) => item.id === request.id ? { ...item, status: 'Practice sent' } : item), sent: [...current.sent, `${request.studentId}: ${practice}`] })); notify(`Practice recommendation sent to ${person(request.studentId).name}.`) }
  const sendReply = () => { if (!request || !message.trim()) return; update((current) => ({ ...current, help: current.help.map((item) => item.id === request.id ? { ...item, status: 'Replied' } : item), sent: [...current.sent, `${request.studentId}: ${message.trim()}`] })); setMessage(''); notify(`Reply sent privately to ${person(request.studentId).name}.`) }
  const newCount = data.help.filter((item) => item.status === 'New').length
  return <>
    <PageHeader title="Help requests" description="A private place to respond, recommend practice, and book office hours." actions={<Button variant="ghost" onClick={() => setScreen('dashboard')}>Back to dashboard</Button>} />
    <div className="t-split">
      <Card padded={false} className="t-split-aside">
        <CardHeader title="Student requests" action={<Badge tone={newCount ? 'warning' : 'neutral'}>{newCount} new</Badge>} />
        <div className="t-list">{data.help.map((item) => <ListItem key={item.id} active={item.id === selected} onClick={() => setSelected(item.id)} leading={<Avatar name={person(item.studentId).name} />} title={person(item.studentId).name} subtitle={<><span className="t-list-topic">{item.topic}</span><span className="t-clamp">{item.message}</span></>} trailing={<Badge tone={item.status === 'New' ? 'warning' : 'success'}>{item.status}</Badge>} />)}</div>
      </Card>

      {request ? <Card padded={false} className="t-split-main">
        <CardHeader title={person(request.studentId).name} description="Private student request" action={<Badge tone={request.status === 'New' ? 'warning' : 'success'} dot>{request.status}</Badge>} />
        <div className="t-card-section">
          <DescriptionList items={[{ term: 'Selected topic', detail: request.topic }]} />
          <blockquote className="t-blockquote">{request.message}</blockquote>
        </div>
        <div className="t-card-section">
          <h3 className="t-subheading"><Calendar size={15} aria-hidden="true" /> Book an office hour</h3>
          <div className="t-field">
            <label htmlFor="help-slot">Office-hour slot</label>
            <select id="help-slot" className="t-input t-select" value={slot} onChange={(event) => setSlot(event.target.value)}>{[...availableSlots, ...(request.booking && !availableSlots.includes(request.booking) ? [request.booking] : [])].map((availableSlot) => <option key={availableSlot}>{availableSlot}</option>)}</select>
            {availableSlots.length === 0 && !request.booking && <small className="t-hint">No office-hour slots are currently available.</small>}
          </div>
          <TextArea label="Optional message to student" rows={3} value={message} onChange={setMessage} placeholder="Add a private reply with the booking." />
          <div className="t-actions t-actions-end">
            <Button variant="secondary" onClick={sendReply} disabled={!message.trim()}>Send reply</Button>
            <Button icon={<Check size={15} />} onClick={book} disabled={request.status === 'Office hour booked' || (!availableSlots.includes(slot) && request.booking !== slot)}>{request.status === 'Office hour booked' ? `Booked · ${request.booking}` : 'Book office hour'}</Button>
          </div>
        </div>
        <div className="t-card-section">
          <h3 className="t-subheading"><BookOpen size={15} aria-hidden="true" /> Practice recommendation</h3>
          <div className="t-inline-form">
            <SelectField label="Choose practice" value={practice} options={['Comparing fractions · 5 questions', 'Equivalent fractions · 5 questions', 'Word problems · 5 questions']} onChange={setPractice} />
            <Button variant="secondary" icon={<Send size={14} />} onClick={sendPractice}>Send practice</Button>
          </div>
        </div>
      </Card> : <Card><EmptyState icon={<Inbox size={20} />} title="No help requests yet." description="New private requests from students will appear here." /></Card>}
    </div>
  </>
}
