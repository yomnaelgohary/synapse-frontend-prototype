'use client'

/**
 * Teacher interface translation (FR: "switch the whole interface between
 * English and German at any time").
 *
 * The teacher components render English strings. Instead of threading t()
 * through every handler-bearing line, this layer translates what is rendered
 * inside the teacher root: text nodes plus aria-label / title / placeholder.
 * It keeps the English source of every node, so switching back and forth is
 * instant and React updates (new English text) are re-translated on the fly.
 *
 * Never translated: anything the teacher types (inputs, textareas, the OCR
 * editor and scan, marked data-no-translate) and <option> values (options
 * carry explicit English values, so handlers never see German text).
 */

import { useEffect, type RefObject } from 'react'
import { teacherDe, teacherEntities } from './i18n-de'

export type TeacherLanguage = 'EN' | 'DE'

const STUDENT_NAMES = ['Malak Adel', 'Omar Khaled', 'Laila Samir', 'Youssef Ali', 'Nour Hassan', 'Karim Mostafa', 'Lina Hamdy', 'Adam Samy', 'Mariam Fathy', 'Yassin Tarek', 'Salma Nabil', 'Ziad Hossam']

/** Data values that may appear inside longer strings: names stay as they are, the others are translated via the dictionary. */
const ENTITIES = [...STUDENT_NAMES, ...teacherEntities].sort((a, b) => b.length - a.length)
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const ENTITY_RE = new RegExp(`(${ENTITIES.map(escape).join('|')})|(\\d+(?:[.,]\\d+)?)`, 'g')

const MONTHS: Record<string, string> = { Jan: 'Jan.', Feb: 'Feb.', Mar: 'März', Apr: 'Apr.', May: 'Mai', Jun: 'Juni', Jul: 'Juli', Aug: 'Aug.', Sep: 'Sep.', Oct: 'Okt.', Nov: 'Nov.', Dec: 'Dez.' }

/** Translates one English UI string to German (or returns it unchanged if unknown). */
export function translateToGerman(text: string): string {
  const lead = text.match(/^\s*/)?.[0] ?? ''
  const trail = text.match(/\s*$/)?.[0] ?? ''
  const core = text.trim()
  if (!core) return text
  return lead + translateCore(core) + trail
}

function translateCore(core: string): string {
  if (teacherDe[core]) return teacherDe[core]
  // Dates such as "Oct 18, 2026" -> "18. Okt. 2026"
  const date = core.match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/)
  if (date && MONTHS[date[1]]) return `${date[2]}. ${MONTHS[date[1]]} ${date[3]}`
  // Times such as "3:30 PM" -> "15:30 Uhr" (anything after the time is translated too)
  const time = core.match(/^(\d{1,2}):(\d{2}) (AM|PM)(.*)$/)
  if (time) {
    const hours = (Number(time[1]) % 12) + (time[3] === 'PM' ? 12 : 0)
    return `${hours}:${time[2]} Uhr${time[4] ? translateCore(time[4]) : ''}`
  }
  // "A · B · C": translate each piece
  if (core.includes(' · ')) return core.split(' · ').map((part) => translateCore(part)).join(' · ')
  const fill = (template: string, values: string[]) => template.replace(/\{(\d+)\}/g, (_, index) => {
    const value = values[Number(index)] ?? ''
    return STUDENT_NAMES.includes(value) || /^\d/.test(value) ? value : translateCore(value)
  })
  // Template with numbers only, then with names / data values / numbers.
  const numbers: string[] = []
  const numberTemplate = core.replace(/\d+(?:[.,]\d+)?/g, (match) => { numbers.push(match); return `{${numbers.length - 1}}` })
  if (numbers.length && teacherDe[numberTemplate]) return fill(teacherDe[numberTemplate], numbers)
  const values: string[] = []
  const template = core.replace(ENTITY_RE, (match) => { values.push(match); return `{${values.length - 1}}` })
  if (values.length && template !== '{0}' && teacherDe[template]) return fill(teacherDe[template], values)
  // Last resort: wildcard templates for free text such as teacher-typed exam titles.
  for (const [pattern, keys, german] of WILDCARDS) {
    const match = core.match(pattern)
    if (match) { let index = 0; return german.replace(/\{\*\}/g, () => translateCore(match[keys[index++]] ?? '')) }
  }
  return core
}

/** Keys containing {*}: compiled once to regexes; {*} captures free text (translated recursively). */
const WILDCARDS: Array<[RegExp, number[], string]> = Object.entries(teacherDe).filter(([key]) => key.includes('{*}')).map(([key, german]) => {
  const parts = key.split('{*}').map(escape)
  return [new RegExp(`^${parts.join('(.+?)')}$`), parts.slice(1).map((_, index) => index + 1), german]
})

/* ------------------------------------------------------------- DOM layer */

const ATTRS = ['aria-label', 'title', 'placeholder'] as const
type Source = { source: string; output: string }
const textSources = new WeakMap<Text, Source>()
const attrSources = new WeakMap<Element, Record<string, Source>>()

const skip = (node: Node) => {
  const el = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return !el || Boolean(el.closest('textarea, input, script, style, [data-no-translate]'))
}

function translateText(node: Text, language: TeacherLanguage) {
  if (skip(node)) return
  const current = node.nodeValue ?? ''
  const known = textSources.get(node)
  // If React wrote new text since our last change, that new text is the English source.
  const source = known && current === known.output ? known.source : current
  const output = language === 'DE' ? translateToGerman(source) : source
  textSources.set(node, { source, output })
  if (current !== output) node.nodeValue = output
}

function translateAttrs(el: Element, language: TeacherLanguage) {
  if (el.closest('[data-no-translate]')) return
  const record = attrSources.get(el) ?? {}
  for (const name of ATTRS) {
    const current = el.getAttribute(name)
    if (current === null) continue
    const known = record[name]
    const source = known && current === known.output ? known.source : current
    const output = language === 'DE' ? translateToGerman(source) : source
    record[name] = { source, output }
    if (current !== output) el.setAttribute(name, output)
  }
  attrSources.set(el, record)
}

function translateTree(root: Node, language: TeacherLanguage) {
  if (root.nodeType === Node.TEXT_NODE) { translateText(root as Text, language); return }
  if (root.nodeType !== Node.ELEMENT_NODE) return
  translateAttrs(root as Element, language)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) translateText(node as Text, language)
    else translateAttrs(node as Element, language)
  }
}

/** Keeps the teacher root translated while it renders; re-runs when the language changes. */
export function useTeacherTranslation(rootRef: RefObject<HTMLElement | null>, language: TeacherLanguage) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    translateTree(root, language)
    const observer = new MutationObserver((mutations) => {
      observer.disconnect() // our own writes must not re-trigger the observer
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateText(mutation.target as Text, language)
        else if (mutation.type === 'attributes') translateAttrs(mutation.target as Element, language)
        else mutation.addedNodes.forEach((node) => translateTree(node, language))
      }
      observer.observe(root, OPTIONS)
    })
    const OPTIONS: MutationObserverInit = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] }
    observer.observe(root, OPTIONS)
    return () => observer.disconnect()
  }, [rootRef, language])
}
