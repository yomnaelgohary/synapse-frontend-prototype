'use client'

import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { ArrowRight, Check, ClipboardList, Divide, Home, Hourglass, Languages, Lightbulb, MessageCircle, Search, Sparkles, Sprout, Star } from 'lucide-react'

type Language = 'en' | 'de'
type Quiz = { id: string; title: string; subject: string; date: string; score?: string; status: 'graded' | 'checking' }

const quizzes: Quiz[] = [
  { id: 'quiz-3', title: 'Math Quiz 3: Fractions', subject: 'Math', date: 'October 18, 2026', status: 'checking' },
  { id: 'quiz-2', title: 'Math Quiz 2: Fractions', subject: 'Math', date: 'October 12, 2026', score: '8 / 10', status: 'graded' },
  { id: 'science-2', title: 'Science Quiz 2: Living Things', subject: 'Science', date: 'October 8, 2026', status: 'checking' }
]

const text = {
  en: {
    eyebrow: 'My results', title: 'My submitted exams', description: 'Choose an exam to see your grade and feedback.', home: 'Home', status: 'Your teacher is checking your exam', checking: 'Your teacher is checking your exam', checkingDetail: 'Your grade and feedback will show here after your teacher has reviewed and released them.', confirmed: 'Grade confirmed and released', total: 'Your total', teacher: 'A note from Ms. Nadine', teacherNote: 'Great effort! You are getting better at finding equivalent fractions.', answers: 'Your answers', score: 'Score', correct: 'Correct', sure: 'You said you were sure', lookTitle: 'Look again', lookSummary: 'Take another look', myAnswer: 'Your answer', hint: 'Hint', solution: 'How to solve it', hintText: 'When the denominators are different, make them the same before you compare the numerators.', solutionText: '3/5 is larger than 2/5. The denominators are both 5, so compare the top numbers: 3 is greater than 2.', checkingDate: 'Submitted', questions: '3 questions', grades: 'Your grade', weakSkills: 'Skills to practise', skillHelp: 'These are small steps to help you feel more confident.', practiceTitle: 'Practice from your teacher', markDone: 'Mark as done', markedDone: 'Done', languageWord: 'A tricky word', germanWord: 'German', englishWord: 'English', teacherFeedback: 'Teacher feedback'
  },
  de: {
    eyebrow: 'Meine Ergebnisse', title: 'Meine abgegebenen Prüfungen', description: 'Wähle eine Prüfung aus, um deine Note und Rückmeldung anzusehen.', home: 'Startseite', status: 'Deine Lehrkraft prüft deine Prüfung', checking: 'Deine Lehrkraft prüft deine Prüfung', checkingDetail: 'Deine Note und Rückmeldung erscheinen hier, sobald deine Lehrkraft die Prüfung geprüft und freigegeben hat.', confirmed: 'Note bestätigt und freigegeben', total: 'Deine Gesamtnote', teacher: 'Eine Nachricht von Frau Nadine', teacherNote: 'Gut gemacht! Du findest immer besser gleichwertige Brüche.', answers: 'Deine Antworten', score: 'Punkte', correct: 'Richtig', sure: 'Du warst dir sicher', lookTitle: 'Noch einmal ansehen', lookSummary: 'Hinweis und Lösung ansehen', myAnswer: 'Deine Antwort', hint: 'Hinweis', solution: 'So löst du die Aufgabe', hintText: 'Wenn die Nenner unterschiedlich sind, bringe sie zuerst auf den gleichen Wert und vergleiche dann die Zähler.', solutionText: '3/5 ist größer als 2/5. Die Nenner sind beide 5. Vergleiche daher die Zähler: 3 ist größer als 2.', checkingDate: 'Abgegeben am', questions: '3 Fragen', grades: 'Deine Note', weakSkills: 'Meine Lernfelder', skillHelp: 'Kleine Schritte helfen dir, sicherer zu werden.', practiceTitle: 'Übungen von deiner Lehrkraft', markDone: 'Als erledigt markieren', markedDone: 'Erledigt', languageWord: 'Ein schwieriges Wort', germanWord: 'Deutsch', englishWord: 'Englisch', teacherFeedback: 'Rückmeldung der Lehrkraft'
  }
} as const

const answers = [
  { number: 1, question: { en: 'Which fraction is larger: 3/4 or 2/3?', de: 'Welcher Bruch ist größer: 3/4 oder 2/3?' }, answer: '3/4', score: '3 / 3', correct: true },
  { number: 2, question: { en: 'Compare 2/5 and 3/5.', de: 'Vergleiche 2/5 und 3/5.' }, answer: '2/5', score: '1 / 3', correct: false, sure: true },
  { number: 3, question: { en: 'Which fraction is equivalent to 1/2?', de: 'Welcher Bruch entspricht 1/2?' }, answer: '4/8', score: '4 / 4', correct: true }
]

type TeacherAnswer = { examId: string; studentId: string; q: number; cause: string; confirmed: boolean; score: number; max: number; feedbackEn: string; feedbackDe: string; germanKeyword: string; englishTranslation: string; feedbackLanguage?: 'English' | 'German'; keywords?: Array<{ german: string; english: string }> }
type PracticeAssignment = { id: string; studentId: string; skill: string; exercises: string[] }
type TeacherData = { answers?: TeacherAnswer[]; practiceAssignments?: PracticeAssignment[]; flags?: Array<{ studentId: string; skill: string; status: string }> }

const friendlySkillLabels: Record<Language, Record<string, string>> = {
  en: { 'Comparing Fractions': 'Tell which fraction is bigger', 'Equivalent Fractions': 'Find fractions that mean the same amount', 'Adding Fractions': 'Put fractions together', 'Word Problems': 'Choose the right math step', 'Animal Habitats': 'Learn what animals need at home' },
  de: { 'Comparing Fractions': 'Erkenne, welcher Bruch größer ist', 'Equivalent Fractions': 'Finde Brüche mit demselben Wert', 'Adding Fractions': 'Brüche zusammenzählen', 'Word Problems': 'Finde den passenden Rechenschritt', 'Animal Habitats': 'Lerne, was Tiere zum Leben brauchen' },
}

const sampleAssignments: PracticeAssignment[] = [
  { id: 'sample-compare-fractions', studentId: 'malak', skill: 'Comparing Fractions', exercises: ['Compare 3/4 and 2/3. Which is larger?', 'Make the bottom numbers the same for 2/5 and 3/5.'] },
  { id: 'sample-equivalent-fractions', studentId: 'malak', skill: 'Equivalent Fractions', exercises: ['Write an equivalent fraction for 1/2.', 'Complete: 2/4 = __ / 8.'] },
]

export function StudentResults({ language, setScreen, SynaMascot, StatusTracker }: { language: Language; setScreen: (screen: string) => void; SynaMascot: ComponentType<{ size?: 'hero' | 'tip'; decorative?: boolean }>; StatusTracker: ComponentType<{ current?: number; currentIcon?: ReactNode }> }) {
  const copy = text[language]
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [practiceDone, setPracticeDone] = useState<Record<string, boolean[]>>({})
  const [selectedId, setSelectedId] = useState('quiz-2')
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('synapse-teacher-workflow-v1')
      if (saved) setTeacherData(JSON.parse(saved) as TeacherData)
    } catch {
      setTeacherData(null)
    }
  }, [])
  const selected = quizzes.find((quiz) => quiz.id === selectedId) ?? quizzes[1]
  const formatSubject = (quiz: Quiz) => language === 'de' ? quiz.subject === 'Math' ? 'Mathe' : 'Naturwissenschaften' : quiz.subject
  const formatTitle = (quiz: Quiz) => language === 'de' ? quiz.id === 'quiz-3' ? 'Mathetest 3: Brüche' : quiz.id === 'quiz-2' ? 'Mathetest 2: Brüche' : 'Naturwissenschaftstest 2: Lebewesen' : quiz.title
  const formatDate = (quiz: Quiz) => language === 'de' ? quiz.id === 'quiz-3' ? '18. Oktober 2026' : quiz.id === 'quiz-2' ? '12. Oktober 2026' : '8. Oktober 2026' : quiz.date
  const questionSkills = ['Comparing Fractions', 'Equivalent Fractions', 'Adding Fractions']
  const dataWeakSkills = teacherData?.answers
    ? teacherData.answers.filter((answer) => answer.studentId === 'malak' && answer.examId === selected.id && answer.confirmed && answer.cause === 'Concept error' && answer.score < answer.max).map((answer) => questionSkills[answer.q]).filter((skill): skill is string => Boolean(skill))
    : ['Comparing Fractions', 'Equivalent Fractions']
  const flagSkills = teacherData?.flags?.filter((flag) => flag.studentId === 'malak' && flag.status === 'Confirmed').map((flag) => flag.skill) ?? []
  const weakSkills = [...new Set([...dataWeakSkills, ...flagSkills])]
  const assignments = teacherData?.practiceAssignments ?? sampleAssignments
  const assignedPractices = assignments.filter((assignment) => assignment.studentId === 'malak' && weakSkills.includes(assignment.skill))
  // German keyword list the teacher added (FR 54); older data stored a single pair.
  const keywordList = (answer: TeacherAnswer) => (answer.keywords ?? [{ german: answer.germanKeyword, english: answer.englishTranslation }]).filter((item) => item.german?.trim() && item.english?.trim())
  const languageErrors = teacherData?.answers?.filter((answer) => answer.studentId === 'malak' && answer.examId === selected.id && (answer.cause === 'Language error' || keywordList(answer).length > 0)) ?? []
  const friendlySkill = (skill: string) => friendlySkillLabels[language][skill] ?? skill
  const togglePracticeDone = (assignment: PracticeAssignment, index: number) => {
    setPracticeDone((current) => {
      const completed = current[assignment.id] ?? assignment.exercises.map(() => false)
      return { ...current, [assignment.id]: completed.map((done, itemIndex) => itemIndex === index ? !done : done) }
    })
  }

  return <div className="student-results results-sticker-page" lang={language}>
    <header className="results-sticker-hero">
      <span className="results-sticker-orbit" aria-hidden="true" />
      <Star className="results-sticker-star" aria-hidden="true" />
      <div className="results-sticker-mascot"><SynaMascot size="tip" decorative /></div>
      <div className="results-sticker-hero-copy">
        <span className="results-sticker-eyebrow"><ClipboardList aria-hidden="true" />{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>
      <button type="button" className="results-sticker-home" onClick={() => setScreen('home')}><Home aria-hidden="true" />{copy.home}</button>
    </header>

    <nav className="results-sticker-picker" aria-label={copy.title}>{quizzes.map((quiz) => <button type="button" key={quiz.id} className={`results-sticker-exam ${selected.id === quiz.id ? 'active' : ''}`} aria-pressed={selected.id === quiz.id} onClick={() => setSelectedId(quiz.id)}>
      <span className={`results-sticker-subject ${quiz.subject === 'Math' ? 'math' : 'science'}`} aria-hidden="true">{quiz.subject === 'Math' ? <Divide /> : <Sprout />}</span>
      <span className="results-sticker-exam-copy"><strong>{formatTitle(quiz)}</strong><small>{formatSubject(quiz)} · {formatDate(quiz)}</small></span>
      <span className={`results-sticker-status ${quiz.status}`}>
        {quiz.status === 'graded' ? <><Star aria-hidden="true" />{quiz.score}</> : <><Hourglass aria-hidden="true" />{copy.status}</>}
      </span>
      {selected.id === quiz.id && <span className="results-sticker-selected" aria-hidden="true"><Check /></span>}
    </button>)}</nav>

    {selected.status === 'checking' ? <section className="results-sticker-waiting">
      <div className="results-sticker-waiting-head"><div className="results-sticker-waiting-mascot"><SynaMascot size="tip" decorative /></div><span className="results-sticker-status checking"><Hourglass aria-hidden="true" />{formatTitle(selected)}</span><h2>{copy.checking}</h2><p>{copy.checkingDate} {selected.date}. {copy.checkingDetail}</p></div>
      <StatusTracker current={1} currentIcon={<Search aria-hidden="true" />} />
    </section> : <>
      <section className="results-sticker-grade">
        <span className="results-sticker-grade-orbit" aria-hidden="true" />
        <div className="results-sticker-grade-score"><span>{copy.total}</span><div className="results-sticker-score-label"><strong>8</strong><small>/ 10</small></div><span className="results-sticker-dots" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < 8 ? 'earned' : ''} />)}</span><span className="results-sticker-confirmed"><Check aria-hidden="true" />{copy.confirmed}</span></div>
        <div className="results-sticker-note"><span className="results-sticker-note-icon"><MessageCircle aria-hidden="true" /></span><div><strong>{copy.teacher}</strong><p>{copy.teacherNote}</p></div></div>
      </section>
      <section className="results-sticker-answers">
        <header className="results-sticker-section-head"><div><h2>{copy.answers}</h2><span className="results-sticker-question-chip">{copy.questions}</span></div><span className="results-sticker-score-label-head">{copy.score}</span></header>
        <ol className="results-sticker-answer-list">{answers.map((answer) => <li key={answer.number} className={`results-sticker-answer ${answer.correct ? 'correct' : 'needs-review'}`}>
          <div className="results-sticker-answer-top"><span className={`results-sticker-number ${answer.correct ? 'correct' : 'needs-review'}`}>{answer.number}</span><div className="results-sticker-question"><strong>{answer.question[language]}</strong><small>{copy.myAnswer}: <b>{answer.answer}</b></small></div><span className="results-sticker-answer-score">{answer.correct ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}{answer.score}</span></div>
          {languageErrors.filter((item) => item.q === answer.number - 1).map((item) => <aside className="results-sticker-language-note" key={`${item.examId}-${item.q}`}><div className="results-sticker-language-title"><Languages aria-hidden="true" /><strong>{copy.languageWord}</strong></div>{(keywordList(item).length ? keywordList(item) : [{ german: '—', english: '—' }]).map((pair) => <div className="results-sticker-word-pair" key={pair.german}><div><span>{copy.germanWord}</span><strong>{pair.german}</strong></div><div><span>{copy.englishWord}</span><strong>{pair.english}</strong></div></div>)}<div className="results-sticker-feedback-pair">{item.feedbackLanguage !== 'German' && <p><span>English</span>{item.feedbackEn}</p>}{item.feedbackLanguage !== 'English' && <p><span>Deutsch</span>{item.feedbackDe}</p>}</div></aside>)}
          {!answer.correct && answer.sure && <details className="results-sticker-look-again"><summary><span className="results-sticker-bulb"><Lightbulb aria-hidden="true" /></span><span className="results-sticker-look-copy"><strong>{copy.lookTitle}</strong><small>{copy.sure}</small></span><span className="results-sticker-look-action">{copy.lookSummary}<ArrowRight aria-hidden="true" /></span></summary><div className="results-sticker-look-content"><div><span>{copy.myAnswer}</span><strong>{answer.answer}</strong></div><div><span>{copy.hint}</span><p>{copy.hintText}</p></div><div><span>{copy.solution}</span><p>{copy.solutionText}</p></div></div></details>}
        </li>)}</ol>
      </section>
      <section className="results-sticker-support" aria-labelledby="results-support-heading">
        <header className="results-sticker-support-heading"><div><span className="results-sticker-eyebrow"><Sprout aria-hidden="true" />{copy.weakSkills}</span><h2 id="results-support-heading">{copy.skillHelp}</h2></div></header>
        <div className="results-sticker-skills">
          {weakSkills.length ? weakSkills.map((skill) => <article className="results-sticker-skill" key={skill}><span className="results-sticker-skill-icon"><Sprout aria-hidden="true" /></span><div><strong>{friendlySkill(skill)}</strong><small>{language === 'de' ? `Wir üben: ${friendlySkill(skill).toLowerCase()}.` : `We are practising: ${friendlySkill(skill).toLowerCase()}.`}</small></div></article>) : <p className="results-sticker-empty">{language === 'de' ? 'Deine Lehrkraft hat noch keine Lernfelder markiert.' : 'Your teacher has not marked any skills to practise yet.'}</p>}
        </div>
        {assignedPractices.length > 0 && <div className="results-sticker-practice-list"><h3>{copy.practiceTitle}</h3>{assignedPractices.map((assignment) => {
          const completed = practiceDone[assignment.id] ?? assignment.exercises.map(() => false)
          return <article className="results-sticker-practice" key={assignment.id}><h4>{friendlySkill(assignment.skill)}</h4><ol>{assignment.exercises.map((exercise, index) => <li key={`${assignment.id}-${index}`} className={completed[index] ? 'done' : ''}><span>{exercise}</span><button type="button" aria-pressed={completed[index]} aria-label={`${completed[index] ? copy.markedDone : copy.markDone}: ${exercise}`} onClick={() => togglePracticeDone(assignment, index)}><Check aria-hidden="true" />{completed[index] ? copy.markedDone : copy.markDone}</button></li>)}</ol></article>
        })}</div>}
      </section>
    </>}
  </div>
}
