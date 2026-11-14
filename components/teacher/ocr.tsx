'use client'

/**
 * OCR review building blocks for the "Verify extracted text" step
 * (FR 41 scan next to OCR text, FR 42 uncertain tokens, FR 43 zoom + edit).
 *
 * The prototype has no real OCR engine, so token confidence is simulated
 * deterministically from the answer and token. Numbers and fractions are
 * treated as harder to read than words, as in real handwriting OCR.
 */

import { useLayoutEffect, useRef } from 'react'
import { Caveat } from 'next/font/google'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { cx } from './ui'

const handwriting = Caveat({ subsets: ['latin'], weight: ['500'], display: 'swap' })

/** Below this confidence a token is shown as "OCR unsure". */
export const UNSURE_THRESHOLD = 0.8
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 2
export const ZOOM_STEP = 0.25

/** Small stable hash so the same answer always gets the same confidences. */
const hash = (value: string) => [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7)

export type OcrToken = { text: string; confidence: number; unsure: boolean }

/**
 * Splits the original OCR text into tokens with a confidence each.
 * Numbers/fractions: 58–95 %, words: 78–99 %; anything under 80 % is unsure.
 */
export function ocrTokens(scanText: string, seed: string): OcrToken[] {
  return scanText.split(/\s+/).filter(Boolean).map((text, index) => {
    const h = hash(`${seed}:${index}:${text}`)
    const numeric = /\d/.test(text)
    const confidence = numeric ? 0.58 + (h % 38) / 100 : 0.78 + (h % 22) / 100
    return { text, confidence, unsure: confidence < UNSURE_THRESHOLD }
  })
}

/**
 * Compares the current (possibly edited) text with the OCR tokens.
 * A word keeps its highlight until the teacher changes it; changed words are
 * marked "corrected" instead.
 */
function annotate(current: string, tokens: OcrToken[]) {
  let wordIndex = -1
  return current.split(/(\s+)/).map((part) => {
    if (!part || /^\s+$/.test(part)) return { part, kind: 'space' as const }
    wordIndex += 1
    const original = tokens[wordIndex]
    if (!original || original.text !== part) return { part, kind: 'corrected' as const }
    return { part, kind: original.unsure ? ('unsure' as const) : ('plain' as const), confidence: original.confidence }
  })
}

/* ------------------------------------------------------------- scan view */

/**
 * The scanned answer. It always shows the ORIGINAL handwriting (never the
 * edited text) and outlines the regions the OCR was unsure about.
 * Zoom changes the rendered size inside a scrollable frame, so a zoomed scan
 * can be panned instead of being cut off.
 */
export function ScanView({ tokens, label, zoom, onZoom }: { tokens: OcrToken[]; label: string; zoom: number; onZoom: (zoom: number) => void }) {
  const clamp = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100))
  return <figure className="t-scan-view">
    <figcaption className="t-scan-head">
      <span className="t-overline">{label}</span>
      <div className="t-zoom" role="group" aria-label="Scan zoom">
        <button type="button" className="t-icon-btn" aria-label="Zoom out" disabled={zoom <= ZOOM_MIN} onClick={() => onZoom(clamp(zoom - ZOOM_STEP))}><ZoomOut size={16} /></button>
        <span aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button type="button" className="t-icon-btn" aria-label="Zoom in" disabled={zoom >= ZOOM_MAX} onClick={() => onZoom(clamp(zoom + ZOOM_STEP))}><ZoomIn size={16} /></button>
        <button type="button" className="t-icon-btn" aria-label="Reset zoom to 100%" disabled={zoom === 1} onClick={() => onZoom(1)}><Maximize2 size={14} /></button>
      </div>
    </figcaption>
    {/* tabIndex lets keyboard users scroll a zoomed scan with the arrow keys */}
    <div className="t-scan-viewport" tabIndex={0} aria-label="Scanned answer. Scroll to pan when zoomed in.">
      <div className={cx('t-scan-paper', handwriting.className)} style={{ width: `${zoom * 100}%`, fontSize: `${28 * zoom}px` }}>
        {tokens.map((token, index) => <span key={index} className={cx('t-ink', token.unsure && 'is-unsure')} title={token.unsure ? `OCR ${Math.round(token.confidence * 100)}% sure` : undefined}>{token.text}</span>)}
      </div>
    </div>
  </figure>
}

/* ------------------------------------------------------------ OCR editor */

/**
 * Editable extracted text with the unsure tokens highlighted IN the editor:
 * a highlight layer sits behind a transparent textarea and mirrors its text,
 * so the teacher edits directly where the highlights are.
 */
export function OcrEditor({ id, value, tokens, disabled, reviewed, onChange, describedBy }: { id: string; value: string; tokens: OcrToken[]; disabled?: boolean; reviewed?: boolean; onChange: (value: string) => void; describedBy?: string }) {
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  // Grow the textarea with its content so text and highlights never drift.
  useLayoutEffect(() => {
    const area = areaRef.current
    if (!area) return
    area.style.height = 'auto'
    area.style.height = `${area.scrollHeight}px`
  }, [value])
  const parts = annotate(value, tokens)
  return <div className={cx('t-ocr-editor', disabled && 'is-disabled', reviewed && 'is-reviewed')}>
    <div ref={backdropRef} className="t-ocr-backdrop" aria-hidden="true">
      {parts.map((item, index) => item.kind === 'space' ? item.part : <mark key={index} className={`is-${item.kind}`}>{item.part}</mark>)}
      {'\n'}
    </div>
    <textarea ref={areaRef} id={id} className="t-ocr-input" value={value} rows={2} disabled={disabled} spellCheck={false} aria-describedby={describedBy}
      onScroll={(event) => { if (backdropRef.current) backdropRef.current.scrollTop = event.currentTarget.scrollTop }}
      onChange={(event) => onChange(event.target.value)} />
  </div>
}

/** Number of tokens in the current text that are still unsure (unchanged). */
export const unsureRemaining = (value: string, tokens: OcrToken[]) => annotate(value, tokens).filter((item) => item.kind === 'unsure').length
