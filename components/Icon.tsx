import type { SVGProps } from 'react'

/**
 * Inline SVG icon set (no webfont dependency — icons can never render as
 * fallback text if a font fails to load).
 */
export type IconName =
  | 'shield-check'
  | 'shield-alert'
  | 'grid'
  | 'chat'
  | 'tune'
  | 'book'
  | 'search'
  | 'phone'
  | 'check'
  | 'check-circle'
  | 'lock'
  | 'arrow-right'
  | 'download'
  | 'doc'
  | 'flag'
  | 'globe'
  | 'sparkle'
  | 'clock'
  | 'card'
  | 'medical'
  | 'home'
  | 'receipt'
  | 'briefcase'
  | 'alert'
  | 'verified'
  | 'send'
  | 'calendar'
  | 'scale'

const PATHS: Record<IconName, React.ReactNode> = {
  'shield-check': (
    <>
      <path d="M12 2.8 4.8 5.6v5.6c0 4.4 3 8.5 7.2 9.9 4.2-1.4 7.2-5.5 7.2-9.9V5.6L12 2.8Z" />
      <path d="m8.9 11.9 2.2 2.2 4-4.2" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'shield-alert': (
    <>
      <path d="M12 2.8 4.8 5.6v5.6c0 4.4 3 8.5 7.2 9.9 4.2-1.4 7.2-5.5 7.2-9.9V5.6L12 2.8Z" />
      <path d="M12 8v4.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="1.15" fill="#fff" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  chat: (
    <>
      <path d="M4.2 5.6h15.6a1.4 1.4 0 0 1 1.4 1.4v8a1.4 1.4 0 0 1-1.4 1.4H9.6L5 20.4v-4H4.2a1.4 1.4 0 0 1-1.4-1.4V7a1.4 1.4 0 0 1 1.4-1.4Z" />
      <circle cx="8.6" cy="11" r="1.1" fill="#fff" />
      <circle cx="12" cy="11" r="1.1" fill="#fff" />
      <circle cx="15.4" cy="11" r="1.1" fill="#fff" />
    </>
  ),
  tune: (
    <>
      <path d="M4 7.5h6M14 7.5h6M4 16.5h9M17 16.5h3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="2.1" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="16.5" r="2.1" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 4.5h6a2.5 2.5 0 0 1 2.5 2.5v12a2 2 0 0 0-2-2H4.5v-12Z" />
      <path d="M19.5 4.5h-6a2.5 2.5 0 0 0-2.5 2.5v12a2 2 0 0 1 2-2h6.5v-12Z" opacity=".55" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="5.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m15.2 15.2 3.9 3.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  phone: (
    <path d="M6.4 3.6h3l1.5 3.7-2 1.4a11.4 11.4 0 0 0 5.4 5.4l1.4-2 3.7 1.5v3a1.6 1.6 0 0 1-1.7 1.6C11.3 17.7 5.9 12.3 4.8 5.3A1.6 1.6 0 0 1 6.4 3.6Z" />
  ),
  check: <path d="m5 12.7 4.3 4.3L19 6.9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.6" opacity=".22" />
      <path d="m8.4 12.3 2.5 2.5 4.7-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="4.6" y="10.2" width="14.8" height="10.2" rx="2.2" />
      <path d="M8.4 10.2V7.9a3.6 3.6 0 0 1 7.2 0v2.3" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  'arrow-right': (
    <path
      d="M4.8 12h13.4m-5.2-5.4L18.4 12l-5.4 5.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  download: (
    <>
      <path d="M12 4.2v10.2m-4.4-4.3L12 14.6l4.4-4.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.8 17.4v1.4a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-1.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </>
  ),
  doc: (
    <>
      <path d="M6.6 3.4h7.2l4.6 4.6v12.6H6.6V3.4Z" />
      <path d="M13.6 3.6v4.6h4.6" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M9.2 12.4h6M9.2 15.6h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  flag: (
    <path d="M6 3.6v17.2M6 5.2h11.4l-2.1 4 2.1 4H6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.6 12h16.8M12 3.4c2.6 2.4 3.9 5.3 3.9 8.6s-1.3 6.2-3.9 8.6c-2.6-2.4-3.9-5.3-3.9-8.6S9.4 5.8 12 3.4Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  sparkle: (
    <path d="M12 3.2 13.9 9l5.7 1.9-5.7 1.9L12 18.6l-1.9-5.8L4.4 11 10.1 9 12 3.2Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.4V12l3.2 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  card: (
    <>
      <rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.2" />
      <path d="M3.4 10h17.2" stroke="#fff" strokeWidth="2" />
      <path d="M6.6 14.4h4v2h-4z" fill="#fff" opacity=".9" />
    </>
  ),
  medical: (
    <>
      <rect x="4.4" y="4.4" width="15.2" height="15.2" rx="3" />
      <path d="M12 8.4v7.2M8.4 12h7.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  home: (
    <path d="M4.4 10.6 12 4.2l7.6 6.4v9H4.4v-9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  ),
  receipt: (
    <>
      <path d="M6.4 3.6h11.2v16.8l-2.8-1.6-2.8 1.6-2.8-1.6-2.8 1.6V3.6Z" />
      <path d="M9.4 8.4h5.2M9.4 12h5.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.6" y="7.4" width="16.8" height="11.6" rx="2" />
      <path d="M9 7.4V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.6 12.4h16.8" stroke="#fff" strokeWidth="1.8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.8 21 19.6H3L12 3.8Z" />
      <path d="M12 9.6v4.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.15" fill="#fff" />
    </>
  ),
  verified: (
    <>
      <path d="M12 2.6 14 5l3.2.4.7 3.1 2.6 1.9-1.2 3 1.2 3-2.6 1.9-.7 3.1L14 21l-2 2.4L10 21l-3.2-.4-.7-3.1L3.5 15.6l1.2-3-1.2-3L6.1 7.5l.7-3.1L10 5l2-2.4Z" opacity=".22" />
      <path d="m8.6 12.2 2.4 2.4 4.4-4.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  send: (
    <path d="M4 11.6 20 4.4l-7 15.2-1.9-6.1L4 11.6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  ),
  calendar: (
    <>
      <rect x="3.8" y="5.4" width="16.4" height="15" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.8 10h16.4M8.4 3.6v3.6M15.6 3.6v3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4.4v15.2M7.2 19.6h9.6M5 8.6h14M12 6.6 8.4 13h7.2L12 6.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
}

export function Icon({
  name,
  className = '',
  size,
  ...rest
}: { name: IconName; className?: string; size?: number } & SVGProps<SVGSVGElement>) {
  const cls = ['icon', className].filter(Boolean).join(' ')
  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
