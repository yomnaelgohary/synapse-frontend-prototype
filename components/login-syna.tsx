'use client'

/**
 * Syna for the login stage. Same body as the app's Syna mascot, plus:
 * - role accessories: glasses (teacher) and a floating heart (parent);
 * - moods driven by the form: 'look' (username focused), 'cover' (password
 *   focused, hands over the eyes), 'cheer' (successful sign-in) and a hop
 *   while the sign-in button is hovered.
 * All motion is CSS (see app/login.css) and switched off under
 * prefers-reduced-motion. The SVG is decorative; the button around it has a
 * real label and only cycles cheers, so it never takes focus from the form.
 */

export type LoginRole = 'student' | 'parent' | 'teacher'
export type SynaMood = 'idle' | 'look' | 'cover' | 'cheer'

export function LoginSyna({ role, mood, hop, bubble, label, onTap }: { role: LoginRole; mood: SynaMood; hop: boolean; bubble: string; label: string; onTap: () => void }) {
  return <div className={`lg-syna-wrap mood-${mood} ${hop ? 'is-hop' : ''}`}>
    {/* Speech bubble: polite live region so a new cheer is read out once. */}
    <p className="lg-syna-bubble" aria-live="polite">{bubble}</p>
    <button type="button" className="lg-syna" aria-label={label} onClick={onTap}>
      <SynaArt role={role} />
    </button>
  </div>
}

/** Syna's drawing (decorative). Reused by the parent hero so both views show the same character. */
export function SynaArt({ role }: { role: LoginRole }) {
  return <svg viewBox="0 0 160 170" aria-hidden="true" focusable="false">
    <ellipse className="lg-syna-shadow" cx="80" cy="162" rx="42" ry="6" fill="#1E2250" opacity=".14" />
    <g className="lg-syna-body">
      {/* antennae */}
      <path d="M60 62C52 42 40 38 32 28M100 62C108 42 120 38 128 28" fill="none" stroke="#1E2250" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="31" cy="25" r="8" fill="#FFC933" stroke="#1E2250" strokeWidth="3.5" />
      <circle cx="129" cy="25" r="8" fill="#FFC933" stroke="#1E2250" strokeWidth="3.5" />
      {/* feet + body */}
      <ellipse cx="60" cy="150" rx="15" ry="8" fill="#3B31C8" stroke="#1E2250" strokeWidth="3.5" />
      <ellipse cx="100" cy="150" rx="15" ry="8" fill="#3B31C8" stroke="#1E2250" strokeWidth="3.5" />
      <ellipse cx="80" cy="104" rx="54" ry="50" fill="#5B50F0" stroke="#1E2250" strokeWidth="4" />
      <ellipse cx="58" cy="78" rx="16" ry="8" fill="#fff" opacity=".28" transform="rotate(-25 58 78)" />
      {/* eyes: the whites blink, the pupils follow the focused field */}
      <g className="lg-syna-eyes">
        <ellipse cx="62" cy="98" rx="14" ry="16" fill="#fff" stroke="#1E2250" strokeWidth="3.5" />
        <ellipse cx="98" cy="98" rx="14" ry="16" fill="#fff" stroke="#1E2250" strokeWidth="3.5" />
        <g className="lg-syna-pupils">
          <circle cx="65" cy="101" r="7" fill="#1E2250" /><circle cx="101" cy="101" r="7" fill="#1E2250" />
          <circle cx="67.5" cy="98" r="2.5" fill="#fff" /><circle cx="103.5" cy="98" r="2.5" fill="#fff" />
        </g>
      </g>
      {role === 'teacher' && <g className="lg-syna-glasses" fill="none" stroke="#1E2250" strokeWidth="3.5" strokeLinecap="round">
        <circle cx="62" cy="98" r="19" /><circle cx="98" cy="98" r="19" />
        <path d="M79 96q1-3 2 0M43 95l-13-5M117 95l13-5" />
      </g>}
      <circle cx="40" cy="120" r="8" fill="#FF9DB5" /><circle cx="120" cy="120" r="8" fill="#FF9DB5" />
      {/* mouth: a smile, opening wide when cheering */}
      <path className="lg-syna-smile" d="M66 120Q80 136 94 120" fill="none" stroke="#1E2250" strokeWidth="5" strokeLinecap="round" />
      <path className="lg-syna-open" d="M66 119Q80 142 94 119Z" fill="#1E2250" stroke="#1E2250" strokeWidth="4" strokeLinejoin="round" />
      {/* hands: resting at the sides, they move over the eyes for the password */}
      <g className="lg-syna-hand lg-syna-hand-left"><circle cx="30" cy="128" r="11" fill="#5B50F0" stroke="#1E2250" strokeWidth="3.5" /></g>
      <g className="lg-syna-hand lg-syna-hand-right"><circle cx="130" cy="128" r="11" fill="#5B50F0" stroke="#1E2250" strokeWidth="3.5" /></g>
    </g>
    {role === 'parent' && <path className="lg-syna-heart" d="M140 44c-6-9-20-5-17 6 2 6 10 11 17 16 7-5 15-10 17-16 3-11-11-15-17-6z" fill="#FF8A6B" stroke="#1E2250" strokeWidth="3" strokeLinejoin="round" />}
  </svg>
}
