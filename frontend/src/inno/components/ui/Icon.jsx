const paths = {
  strategy: (
    <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  content: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </>
  ),
  ads: (
    <path
      d="M4 10v4h3l5 4V6l-5 4H4Z M15 9c1 1 1 5 0 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  analytics: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12V6a6 6 0 0 1 6 6h-6Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  checklist: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  bookmark: <path d="M6 4h12v16l-6-4-6 4V4Z" strokeLinejoin="round" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" strokeLinecap="round" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </>
  ),
  message: <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />,
  'chevron-down': <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  pin: (
    <>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" strokeLinecap="round" />,
  'arrow-right': <path d="M4 12h16M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />,
}

function Icon({ name, size = 24, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {paths[name] ?? null}
    </svg>
  )
}

export default Icon
