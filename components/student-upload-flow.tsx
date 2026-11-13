'use client'

import { useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, Camera, Check, FileText, GripVertical, RotateCcw, Send, ShieldCheck, Trash2, Upload } from 'lucide-react'

type Language = 'en' | 'de'
type Quality = 'clear' | 'blurry' | 'dark' | 'cut'
type DemoFile = { name: string; quality: Quality }
type Page = DemoFile & { id: number }
type Confidence = 'Sure' | 'Not sure' | 'Guessed'
type Response = { confidence: Confidence | null; hardWords: boolean }

const copy = {
  en: {
    title: 'Upload an exam', steps: ['Choose an exam', 'Add pages', 'Sure-Check', 'Review'], subject: 'Subject', math: 'Math', science: 'Science', exam: 'Available exam', examLanguage: 'Exam language', examLanguageHelp: 'This is the language your teacher used for the questions. It is separate from your interface language.', english: 'English', german: 'German', continue: 'Continue', back: 'Back', chooseExam: 'Choose the exam you are uploading.', sureOn: 'Sure-Check is on for this exam', sureInfo: 'After adding your pages, you’ll rate how sure you felt about each answer. Your ratings are private and help your teacher understand your learning.', pagesTitle: 'Add your exam pages', pagesHelp: 'Choose a sample scan below. No files will be opened from your computer.', chooseSample: 'Choose a sample file', capture: 'Take a photo', uploadFile: 'Upload a file', cameraTitle: 'Take a photo of your page', cameraReady: 'Line up your page in the frame, then capture it.', capturePhoto: 'Capture photo', capturedTitle: 'Photo captured', capturedHelp: 'Check that the whole page is clear before adding it.', confirmUpload: 'Confirm upload', cancel: 'Cancel', retakePhoto: 'Retake photo', dragHint: 'To reorder pages, drag a page and release it in the new position.', noPagesError: 'No pages added yet. Choose a sample file or take a photo to continue.', clear: 'Clear scan', blurry: 'Blurry photo', dark: 'Too dark', cut: 'Cut off edges', clearDesc: 'A readable page, ready to add.', blurryDesc: 'The writing is out of focus.', darkDesc: 'The page is too dim to read.', cutDesc: 'Part of the page is missing.', retake: 'Retake with a clear photo', addAnyway: 'Add this page anyway', added: 'Page added', page: 'Page', remove: 'Remove page', noPages: 'Choose a sample file to get started.', nextSure: 'Continue to Sure-Check', needPage: 'Add at least one clear page to continue.', question: 'Question', of: 'of', prompt: 'How sure do you feel about your answer?', answer: 'Your answer', options: ['Sure', 'Not sure', 'Guessed'], faces: ['🙂', '😐', '🤔'], hardWords: 'The words were hard to understand', hardHelp: 'Tell your teacher if the question wording was difficult.', nextQuestion: 'Next question', review: 'Review my exam', rateFirst: 'Choose how sure you felt before continuing.', reviewTitle: 'Review before you submit', reviewHelp: 'Check your pages and answers. You can change any response before submitting.', pages: 'Exam pages', yourAnswers: 'Your Sure-Check answers', clearLabel: 'Clear', confidence: 'Confidence', hard: 'Hard words', noHard: 'Words were clear', change: 'Change', submit: 'Submit exam', received: 'Your exam was received!', receivedHelp: 'Nice work. Your teacher can now check your paper.', home: 'Back to home', errorTitle: 'This photo needs another try', retakeHelp: 'A clear, complete page helps your teacher read your answers. Retake this sample to replace it with a clear scan.', blurryError: 'This photo is blurry. The words may be hard to read.', darkError: 'This photo is too dark. Try again in brighter light.', cutError: 'The page is cut off. Make sure all four edges are in the photo.', close: 'Choose another file', subjectExam: 'Math Quiz 3: Fractions', scienceExam: 'Science Quiz: Living Things', pageCount: 'pages', responseCount: 'answers saved', mock: 'Sample interaction · no files are uploaded to a server.'
  },
  de: {
    title: 'Prüfung hochladen', steps: ['Prüfung wählen', 'Seiten hinzufügen', 'Sicherheits-Check', 'Überprüfen'], subject: 'Fach', math: 'Mathe', science: 'Naturwissenschaften', exam: 'Verfügbare Prüfung', examLanguage: 'Sprache der Prüfung', examLanguageHelp: 'Das ist die Sprache der Fragen deiner Lehrkraft. Sie ist unabhängig von der Sprache der App.', english: 'Englisch', german: 'Deutsch', continue: 'Weiter', back: 'Zurück', chooseExam: 'Wähle die Prüfung aus, die du hochladen möchtest.', sureOn: 'Der Sicherheits-Check ist für diese Prüfung aktiviert', sureInfo: 'Nach dem Hinzufügen deiner Seiten gibst du an, wie sicher du dir bei jeder Antwort warst. Deine Angaben sind privat und helfen deiner Lehrkraft, dich besser zu unterstützen.', pagesTitle: 'Prüfungsseiten hinzufügen', pagesHelp: 'Wähle unten einen Beispiel-Scan aus. Es werden keine Dateien von deinem Gerät geöffnet.', chooseSample: 'Beispieldatei auswählen', capture: 'Foto aufnehmen', uploadFile: 'Datei hochladen', cameraTitle: 'Nimm ein Foto deiner Seite auf', cameraReady: 'Richte die Seite im Rahmen aus und nimm das Foto auf.', capturePhoto: 'Foto aufnehmen', capturedTitle: 'Foto aufgenommen', capturedHelp: 'Prüfe, ob die ganze Seite gut lesbar ist.', confirmUpload: 'Hochladen bestätigen', cancel: 'Abbrechen', retakePhoto: 'Erneut aufnehmen', dragHint: 'Zum Sortieren eine Seite ziehen und an der neuen Position loslassen.', noPagesError: 'Es wurden noch keine Seiten hinzugefügt. Wähle eine Beispieldatei oder nimm ein Foto auf.', clear: 'Klarer Scan', blurry: 'Unscharfes Foto', dark: 'Zu dunkel', cut: 'Rand abgeschnitten', clearDesc: 'Eine gut lesbare Seite, bereit zum Hinzufügen.', blurryDesc: 'Die Schrift ist unscharf.', darkDesc: 'Die Seite ist zu dunkel zum Lesen.', cutDesc: 'Ein Teil der Seite fehlt.', retake: 'Mit einem klaren Foto neu aufnehmen', addAnyway: 'Seite trotzdem hinzufügen', added: 'Seite hinzugefügt', page: 'Seite', remove: 'Seite entfernen', noPages: 'Wähle eine Beispieldatei aus, um zu beginnen.', nextSure: 'Weiter zum Sicherheits-Check', needPage: 'Füge mindestens eine klare Seite hinzu, um fortzufahren.', question: 'Frage', of: 'von', prompt: 'Wie sicher fühlst du dich mit deiner Antwort?', answer: 'Deine Antwort', options: ['Sicher', 'Nicht sicher', 'Geraten'], faces: ['🙂', '😐', '🤔'], hardWords: 'Die Wörter waren schwer zu verstehen', hardHelp: 'Sag deiner Lehrkraft, wenn die Formulierung der Frage schwierig war.', nextQuestion: 'Nächste Frage', review: 'Prüfung überprüfen', rateFirst: 'Wähle zuerst aus, wie sicher du dir warst.', reviewTitle: 'Vor dem Abgeben überprüfen', reviewHelp: 'Prüfe deine Seiten und Antworten. Du kannst alles vor dem Abgeben ändern.', pages: 'Prüfungsseiten', yourAnswers: 'Deine Angaben zur Sicherheit', clearLabel: 'Klar', confidence: 'Sicherheit', hard: 'Schwierige Wörter', noHard: 'Wörter waren verständlich', change: 'Ändern', submit: 'Prüfung abgeben', received: 'Deine Prüfung wurde empfangen!', receivedHelp: 'Gut gemacht! Deine Lehrkraft kann deine Prüfung jetzt prüfen.', home: 'Zurück zur Startseite', errorTitle: 'Dieses Foto braucht einen neuen Versuch', retakeHelp: 'Eine klare, vollständige Seite hilft deiner Lehrkraft, deine Antworten zu lesen. Nimm dieses Beispiel noch einmal auf, um es durch einen klaren Scan zu ersetzen.', blurryError: 'Dieses Foto ist unscharf. Die Wörter sind möglicherweise schwer zu lesen.', darkError: 'Dieses Foto ist zu dunkel. Versuche es mit mehr Licht.', cutError: 'Ein Teil der Seite fehlt. Achte darauf, dass alle vier Ränder zu sehen sind.', close: 'Andere Datei wählen', subjectExam: 'Mathetest 3: Brüche', scienceExam: 'Naturwissenschaftstest: Lebewesen', pageCount: 'Seiten', responseCount: 'gespeicherte Antworten', mock: 'Beispielablauf · Es werden keine Dateien auf einen Server hochgeladen.'
  }
} as const

const questions: Record<Language, string[]> = {
  en: ['Which fraction is larger: 3/4 or 2/3?', 'Which fraction is equivalent to 1/2?', 'What is 5/8 + 1/8?'],
  de: ['Welcher Bruch ist größer: 3/4 oder 2/3?', 'Welcher Bruch entspricht 1/2?', 'Was ist 5/8 + 1/8?']
}
const answerSamples = ['3/4', '2/4', '6/8']
const qualityErrors: Record<Language, Record<Exclude<Quality, 'clear'>, string>> = {
  en: { blurry: 'blurryError', dark: 'darkError', cut: 'cutError' },
  de: { blurry: 'blurryError', dark: 'darkError', cut: 'cutError' }
}

export function StudentUploadFlow({ language, onHome, gradeLevel = 4 }: { language: Language; onHome: () => void; gradeLevel?: number }) {
  const t = copy[language]
  const [step, setStep] = useState(1)
  const [subject, setSubject] = useState<'math' | 'science'>('math')
  const [examIndex, setExamIndex] = useState(0)
  const [examLanguage, setExamLanguage] = useState<Language>('en')
  const [pages, setPages] = useState<Page[]>([])
  const [pending, setPending] = useState<Page | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [filePickerOpen, setFilePickerOpen] = useState(false)
  const [pageError, setPageError] = useState(false)
  const [draggedPageId, setDraggedPageId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [responses, setResponses] = useState<Response[]>(questions.en.map(() => ({ confidence: null, hardWords: false })))
  const [questionIndex, setQuestionIndex] = useState(0)

  const samples: DemoFile[] = [
    { name: 'fractions-clear-scan.jpg', quality: 'clear' },
    { name: 'fractions-blurry-photo.jpg', quality: 'blurry' },
    { name: 'fractions-too-dark.jpg', quality: 'dark' },
    { name: 'fractions-cut-off.jpg', quality: 'cut' }
  ]
  const openSample = (sample: DemoFile) => {
    const page = { ...sample, id: Date.now() + Math.random() }
    setFilePickerOpen(false)
    setPageError(false)
    if (sample.quality === 'clear') setPages((current) => [...current, page])
    else setPending(page)
  }
  const addCapturedPhoto = () => {
    setPages((current) => [...current, { id: Date.now() + Math.random(), name: `camera-page-${current.length + 1}.jpg`, quality: 'clear' }])
    setCameraOpen(false)
    setPhotoCaptured(false)
    setPageError(false)
  }
  const handlePageDrop = (targetId: number, sourceId: number) => {
    if (!sourceId) return
    if (sourceId !== targetId) {
      setPages((current) => {
        const from = current.findIndex((page) => page.id === sourceId)
        const to = current.findIndex((page) => page.id === targetId)
        if (from < 0 || to < 0) return current
        const next = [...current]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return next
      })
    }
    setDraggedPageId(null)
    setDropTargetId(null)
  }
  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= pages.length) return
    handlePageDrop(pages[target].id, pages[index].id)
  }
  const updateResponse = (update: Partial<Response>) => setResponses((current) => current.map((response, index) => index === questionIndex ? { ...response, ...update } : response))
  const questionList = questions[examLanguage]
  const availableExams = subject === 'math'
    ? (examLanguage === 'de' ? ['Mathetest 3: Brüche', 'Mathetest 2'] : ['Math Quiz 3: Fractions', 'Math Quiz 2'])
    : (examLanguage === 'de' ? ['Naturwissenschaftstest: Lebewesen', 'Materie und Materialien'] : ['Science Quiz: Living Things', 'Matter & Materials Check'])
  const examName = availableExams[examIndex]

  if (step === 5) return <section className="card success-card upload-receipt"><span className="success-mark"><Check /></span><h1>{t.received}</h1><p>{t.receivedHelp}</p><strong>{examName}</strong><p>{pages.length} {t.pageCount} · {responses.length} {t.responseCount}</p><span className="badge success">{language === 'de' ? 'Hochgeladen' : 'Uploaded'}</span><button className="button primary" onClick={onHome}>{t.home}</button></section>

  return <div className="student-upload-flow" lang={language} onPointerUp={(event) => { if (draggedPageId === null) return; const targetRow = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-page-id]'); handlePageDrop(Number(targetRow?.dataset.pageId) || draggedPageId, draggedPageId) }} onPointerCancel={() => { setDraggedPageId(null); setDropTargetId(null) }}>
    <header className="upload-heading"><div><span className="eyebrow">{t.title}</span><h1>{step === 1 ? t.steps[0] : step === 2 ? t.steps[1] : step === 3 ? t.steps[2] : t.reviewTitle}</h1></div><span className="upload-step-count">{step} / 4</span></header>
    <nav className="upload-steps" aria-label={language === 'de' ? 'Prüfungsschritte' : 'Exam steps'}>{t.steps.map((label, index) => <span key={label} className={step >= index + 1 ? 'current' : ''}><b>{index + 1}</b>{label}</span>)}</nav>

    {step === 1 && <section className="card upload-step-card">
      <p>{t.chooseExam}</p>
      <label className="upload-field">{t.subject}<select value={subject} onChange={(event) => { setSubject(event.target.value as 'math' | 'science'); setExamIndex(0) }}><option value="math">{t.math}</option><option value="science">{t.science}</option></select></label>
      <label className="upload-field">{t.exam}<select value={examIndex} onChange={(event) => setExamIndex(Number(event.target.value))}>{availableExams.map((exam, index) => <option value={index} key={exam}>{exam}</option>)}</select></label>
      <fieldset className="exam-language-select"><legend>{t.examLanguage}</legend><p>{t.examLanguageHelp}</p><div className="confidence-options">{(['en', 'de'] as Language[]).map((code) => <button type="button" key={code} aria-pressed={examLanguage === code} className={examLanguage === code ? 'selected' : ''} onClick={() => { setExamLanguage(code); setResponses(questions[code].map(() => ({ confidence: null, hardWords: false }))) }}>{code === 'en' ? t.english : t.german}<small>{code === 'en' ? 'EN' : 'DE'}</small></button>)}</div></fieldset>
      <div className="upload-info"><ShieldCheck /><div><strong>{t.sureOn}</strong><p>{t.sureInfo}</p></div></div>
      <button className="button primary" onClick={() => setStep(2)}>{t.continue}<ArrowRight /></button>
    </section>}

    {step === 2 && <section className="card upload-step-card">
      <h2>{t.pagesTitle}</h2><p>{t.pagesHelp}</p><div className="upload-source-actions"><button className="button secondary" onClick={() => { setCameraOpen(true); setPhotoCaptured(false); setPageError(false) }}><Camera />{t.capture}</button><button className="button outline" onClick={() => { setFilePickerOpen(true); setPageError(false) }}><Upload />{t.uploadFile}</button></div>
      {pageError && <div className="alert error-alert upload-page-error" role="alert"><AlertCircle />{t.noPagesError}</div>}
      <p className="drag-reorder-note"><GripVertical />{t.dragHint}</p>
      <div className="prototype-note">{t.mock}</div>
      <div className="upload-page-list">{pages.length === 0 ? <p className="upload-empty">{t.noPages}</p> : pages.map((page, index) => <div className={`upload-page-row ${draggedPageId === page.id ? 'dragging' : ''} ${dropTargetId === page.id ? 'drop-target' : ''}`} key={page.id} data-page-id={page.id} onPointerEnter={() => { if (draggedPageId !== null && draggedPageId !== page.id) setDropTargetId(page.id) }}><span className="drag-grip" role="button" tabIndex={0} aria-label={language === 'de' ? `Seite ${index + 1} ziehen oder mit den Pfeiltasten verschieben` : `Drag page ${index + 1} or move it with arrow keys`} aria-grabbed={draggedPageId === page.id} onPointerDown={(event) => { event.preventDefault(); setDraggedPageId(page.id) }} onPointerCancel={() => { setDraggedPageId(null); setDropTargetId(null) }} onKeyDown={(event) => { if (event.key === 'ArrowUp') { event.preventDefault(); movePage(index, -1) } if (event.key === 'ArrowDown') { event.preventDefault(); movePage(index, 1) } }}><GripVertical /></span><span className="page-number">{index + 1}</span><FileText /><div><strong>{t.page} {index + 1}</strong><small>{page.name} · {t.added}</small></div><button type="button" aria-label={t.remove} onClick={() => setPages((current) => current.filter((item) => item.id !== page.id))}><Trash2 /></button></div>)}</div>
      <div className="upload-footer"><button className="button outline" onClick={() => setStep(1)}><ArrowLeft />{t.back}</button><button className="button primary" onClick={() => { if (!pages.length) setPageError(true); else { setPageError(false); setStep(3) } }}>{t.nextSure}<ArrowRight /></button></div>
    </section>}

    {step === 3 && <section className="card sure-check-card">
      <div className="sure-question-top"><span>{t.question} {questionIndex + 1} {t.of} {questionList.length}</span></div><div className="sure-progress"><span style={{ width: `${((questionIndex + 1) / questionList.length) * 100}%` }} /></div>
      <section className="question-friendly-card"><span className="question-label">{t.question} {questionIndex + 1}</span><h2>{questionList[questionIndex]}</h2><div className="student-answer"><span>{t.answer}</span><strong>{answerSamples[questionIndex]}</strong></div></section><p className="confidence-prompt">{t.prompt}</p>
      <div className="confidence-options">{t.options.map((option, index) => <button type="button" key={option} aria-pressed={responses[questionIndex].confidence === (['Sure', 'Not sure', 'Guessed'][index] as Confidence)} className={responses[questionIndex].confidence === (['Sure', 'Not sure', 'Guessed'][index] as Confidence) ? 'selected' : ''} onClick={() => updateResponse({ confidence: ['Sure', 'Not sure', 'Guessed'][index] as Confidence })}>{gradeLevel <= 2 && <span className="confidence-face" aria-hidden="true">{t.faces[index]}</span>}<strong>{option}</strong></button>)}</div>
      <label className={`hard-words-toggle ${responses[questionIndex].hardWords ? 'selected' : ''}`}><input type="checkbox" checked={responses[questionIndex].hardWords} onChange={(event) => updateResponse({ hardWords: event.target.checked })} /><span><strong>{t.hardWords}</strong><small>{t.hardHelp}</small></span></label>
      <div className="upload-footer"><button className="button outline" onClick={() => questionIndex === 0 ? setStep(2) : setQuestionIndex(questionIndex - 1)}><ArrowLeft />{t.back}</button>{questionIndex < questionList.length - 1 ? <button className="button primary" disabled={!responses[questionIndex].confidence} onClick={() => setQuestionIndex(questionIndex + 1)}>{t.nextQuestion}<ArrowRight /></button> : <button className="button primary" disabled={responses.some((response) => !response.confidence)} onClick={() => setStep(4)}>{t.review}<ArrowRight /></button>}</div>
      {responses[questionIndex].confidence === null && <small className="upload-validation">{t.rateFirst}</small>}
    </section>}

    {step === 4 && <section className="card upload-step-card"><div className="review-title"><Check /><div><h2>{t.reviewTitle}</h2><p>{t.reviewHelp}</p></div></div><h3>{t.pages}</h3>{pages.map((page, index) => <div className="review-upload-row" key={page.id}><FileText /><strong>{t.page} {index + 1}: {page.name}</strong><button className="text-link" onClick={() => setStep(2)}>{t.change}</button></div>)}<h3>{t.yourAnswers}</h3>{responses.map((response, index) => <div className="review-upload-answer" key={index}><span className="review-q">{t.question} {index + 1}</span><div><strong>{questionList[index]}</strong><p>{t.confidence}: <b>{t.options[['Sure', 'Not sure', 'Guessed'].indexOf(response.confidence ?? 'Sure')]}</b> · {response.hardWords ? t.hard : t.noHard}</p></div><button className="text-link" onClick={() => { setQuestionIndex(index); setStep(3) }}>{t.change}</button></div>)}<div className="upload-footer"><button className="button outline" onClick={() => setStep(3)}><ArrowLeft />{t.back}</button><button className="button primary" onClick={() => setStep(5)}><Send />{t.submit}</button></div></section>}

    {filePickerOpen && <div className="modal-backdrop" role="presentation"><section className="modal demo-picker-modal" role="dialog" aria-modal="true" aria-labelledby="sample-picker-title"><button className="modal-close" aria-label={t.cancel} onClick={() => setFilePickerOpen(false)}>×</button><span className="eyebrow">{t.uploadFile}</span><h2 id="sample-picker-title">{t.chooseSample}</h2><p>{t.pagesHelp}</p><div className="demo-file-grid">{samples.map((sample) => <button key={sample.quality} type="button" className={`demo-file ${sample.quality}`} onClick={() => openSample(sample)}><span className="demo-paper"><FileText /></span><span><strong>{t[sample.quality]}</strong><small>{t[`${sample.quality}Desc` as keyof typeof t]}</small></span><Upload /></button>)}</div><p className="prototype-note">{t.mock}</p></section></div>}
    {cameraOpen && <div className="modal-backdrop" role="presentation"><section className="modal camera-modal" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title"><button className="modal-close" aria-label={t.cancel} onClick={() => { setCameraOpen(false); setPhotoCaptured(false) }}>×</button><div className={`camera-preview ${photoCaptured ? 'captured' : ''}`}>{photoCaptured ? <FileText /> : <Camera />}<span>{photoCaptured ? t.capturedTitle : t.cameraTitle}</span><small>{photoCaptured ? t.capturedHelp : t.cameraReady}</small></div><h2 id="camera-modal-title">{photoCaptured ? t.capturedTitle : t.cameraTitle}</h2><p>{photoCaptured ? t.capturedHelp : t.cameraReady}</p><div className="quality-modal-actions">{photoCaptured ? <><button className="button outline" onClick={() => { setCameraOpen(false); setPhotoCaptured(false) }}>{t.cancel}</button><button className="button outline" onClick={() => setPhotoCaptured(false)}><RotateCcw />{t.retakePhoto}</button><button className="button primary" onClick={addCapturedPhoto}><Upload />{t.confirmUpload}</button></> : <><button className="button outline" onClick={() => setCameraOpen(false)}>{t.cancel}</button><button className="button primary" onClick={() => setPhotoCaptured(true)}><Camera />{t.capturePhoto}</button></>}</div></section></div>}
    {pending && <div className="modal-backdrop" role="presentation"><section className="modal quality-modal" role="dialog" aria-modal="true" aria-labelledby="quality-title"><div className={`quality-preview ${pending.quality}`}><FileText /></div><span className="quality-alert"><AlertCircle />{t.errorTitle}</span><h2 id="quality-title">{t[qualityErrors[language][pending.quality as Exclude<Quality, 'clear'>] as keyof typeof t]}</h2><p>{t.retakeHelp}</p><div className="quality-modal-actions"><button className="button outline" onClick={() => setPending(null)}>{t.close}</button><button className="button primary" onClick={() => { setPending(null); setCameraOpen(true); setPhotoCaptured(false) }}><RotateCcw />{t.retake}</button></div><button className="text-link add-anyway" onClick={() => { setPages((current) => [...current, pending]); setPending(null); setPageError(false) }}>{t.addAnyway}</button></section></div>}
  </div>
}
