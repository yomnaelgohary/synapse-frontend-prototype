'use client'

import { useState } from 'react'
import { ClipboardList, Home, MessageCircle } from 'lucide-react'

type Language = 'en' | 'de'
type Quiz = { id: string; title: string; subject: string; date: string; score?: string; status: 'graded' | 'checking' }

const quizzes: Quiz[] = [
  { id: 'quiz-3', title: 'Math Quiz 3: Fractions', subject: 'Math', date: 'October 18, 2026', status: 'checking' },
  { id: 'quiz-2', title: 'Math Quiz 2: Fractions', subject: 'Math', date: 'October 12, 2026', score: '8 / 10', status: 'graded' },
  { id: 'science-2', title: 'Science Quiz 2: Living Things', subject: 'Science', date: 'October 8, 2026', status: 'checking' }
]

const text = {
  en: {
    eyebrow: 'My results', title: 'My submitted exams', description: 'Choose an exam to see your grade and feedback.', home: 'Home', status: 'Your teacher is checking your exam', checking: 'Your teacher is checking your exam', checkingDetail: 'Your grade and feedback will show here after your teacher has reviewed and released them.', confirmed: 'Grade confirmed and released', total: 'Your total', teacher: 'A note from Ms. Nadine', teacherNote: 'Great effort! You are getting better at finding equivalent fractions.', answers: 'Your answers', score: 'Score', correct: 'Correct', sure: 'You said you were sure', lookTitle: 'Look again', lookSummary: 'Take another look', myAnswer: 'Your answer', hint: 'Hint', solution: 'How to solve it', hintText: 'When the denominators are different, make them the same before you compare the numerators.', solutionText: '3/5 is larger than 2/5. The denominators are both 5, so compare the top numbers: 3 is greater than 2.', checkingDate: 'Submitted', questions: '3 questions', grades: 'Your grade'
  },
  de: {
    eyebrow: 'Meine Ergebnisse', title: 'Meine abgegebenen Prüfungen', description: 'Wähle eine Prüfung aus, um deine Note und Rückmeldung anzusehen.', home: 'Startseite', status: 'Deine Lehrkraft prüft deine Prüfung', checking: 'Deine Lehrkraft prüft deine Prüfung', checkingDetail: 'Deine Note und Rückmeldung erscheinen hier, sobald deine Lehrkraft die Prüfung geprüft und freigegeben hat.', confirmed: 'Note bestätigt und freigegeben', total: 'Deine Gesamtnote', teacher: 'Eine Nachricht von Frau Nadine', teacherNote: 'Gut gemacht! Du findest immer besser gleichwertige Brüche.', answers: 'Deine Antworten', score: 'Punkte', correct: 'Richtig', sure: 'Du warst dir sicher', lookTitle: 'Noch einmal ansehen', lookSummary: 'Hinweis und Lösung ansehen', myAnswer: 'Deine Antwort', hint: 'Hinweis', solution: 'So löst du die Aufgabe', hintText: 'Wenn die Nenner unterschiedlich sind, bringe sie zuerst auf den gleichen Wert und vergleiche dann die Zähler.', solutionText: '3/5 ist größer als 2/5. Die Nenner sind beide 5. Vergleiche daher die Zähler: 3 ist größer als 2.', checkingDate: 'Abgegeben am', questions: '3 Fragen', grades: 'Deine Note'
  }
} as const

const answers = [
  { number: 1, question: { en: 'Which fraction is larger: 3/4 or 2/3?', de: 'Welcher Bruch ist größer: 3/4 oder 2/3?' }, answer: '3/4', score: '3 / 3', correct: true },
  { number: 2, question: { en: 'Compare 2/5 and 3/5.', de: 'Vergleiche 2/5 und 3/5.' }, answer: '2/5', score: '1 / 3', correct: false, sure: true },
  { number: 3, question: { en: 'Which fraction is equivalent to 1/2?', de: 'Welcher Bruch entspricht 1/2?' }, answer: '4/8', score: '4 / 4', correct: true }
]

export function StudentResults({ language, setScreen }: { language: Language; setScreen: (screen: string) => void }) {
  const copy = text[language]
  const [selectedId, setSelectedId] = useState('quiz-2')
  const selected = quizzes.find((quiz) => quiz.id === selectedId) ?? quizzes[1]
  const formatSubject = (quiz: Quiz) => language === 'de' ? quiz.subject === 'Math' ? 'Mathe' : 'Naturwissenschaften' : quiz.subject
  const formatDate = (quiz: Quiz) => language === 'de' ? quiz.id === 'quiz-3' ? '18. Oktober 2026' : quiz.id === 'quiz-2' ? '12. Oktober 2026' : '8. Oktober 2026' : quiz.date

  return <div className="student-results" lang={language}>
    <header className="results-heading"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p></div><button className="button outline results-home" onClick={() => setScreen('home')}><Home />{copy.home}</button></header>
    <nav className="results-exam-list" aria-label={copy.title}>{quizzes.map((quiz) => <button type="button" key={quiz.id} className={`results-exam-option ${selected.id === quiz.id ? 'active' : ''}`} aria-current={selected.id === quiz.id ? 'page' : undefined} onClick={() => setSelectedId(quiz.id)}><span className="results-exam-copy"><strong>{language === 'de' ? quiz.id === 'quiz-3' ? 'Mathetest 3: Brüche' : quiz.id === 'quiz-2' ? 'Mathetest 2: Brüche' : 'Naturwissenschaftstest 2: Lebewesen' : quiz.title}</strong><small>{formatSubject(quiz)} · {formatDate(quiz)}</small></span><span className={`results-status ${quiz.status}`}>{quiz.status === 'graded' ? quiz.score : copy.status}</span></button>)}</nav>

    {selected.status === 'checking' ? <section className="results-checking-card"><span className="results-checking-icon"><ClipboardList /></span><h2>{copy.checking}</h2><p>{copy.checkingDate} {selected.date}. {copy.checkingDetail}</p><div className="results-status-track"><span className="complete">{language === 'de' ? 'Hochgeladen' : 'Uploaded'}</span><span className="current">{language === 'de' ? 'Wird geprüft' : 'Being checked'}</span><span>{language === 'de' ? 'Freigegeben' : 'Released'}</span></div></section> : <>
      <section className="results-grade-card"><div className="results-grade-score"><span>{copy.total}</span><strong>8 <small>/ 10</small></strong><span className="results-status graded">{copy.confirmed}</span></div><div className="results-teacher-note"><MessageCircle /><div><strong>{copy.teacher}</strong><p>{copy.teacherNote}</p></div></div></section>
      <section className="results-answers-section"><header className="results-section-heading"><div><h2>{copy.answers}</h2><p>{copy.questions}</p></div><span>{copy.score}</span></header>
        <div className="results-answer-list">{answers.map((answer) => <article key={answer.number} className={`results-answer-card ${answer.correct ? 'correct' : 'needs-review'}`}><div className="results-answer-top"><span className={`answer-number ${answer.correct ? 'correct' : 'needs-review'}`}>{answer.number}</span><div className="results-answer-question"><strong>{answer.question[language]}</strong><small>{copy.myAnswer}: <b>{answer.answer}</b></small></div><span className="results-answer-score">{answer.score}</span></div>{!answer.correct && answer.sure && <details className="look-again-card"><summary><span className="look-again-mark">!</span><span><strong>{copy.lookTitle}</strong><small>{copy.sure}</small></span><span className="look-again-action">{copy.lookSummary}</span></summary><div className="look-again-content"><div><span>{copy.myAnswer}</span><strong>{answer.answer}</strong></div><div><span>{copy.hint}</span><p>{copy.hintText}</p></div><div><span>{copy.solution}</span><p>{copy.solutionText}</p></div></div></details>}</article>)}</div>
      </section>
    </>}
  </div>
}
