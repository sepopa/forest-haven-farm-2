// Shared inline icon set for Forest Haven Farm.
// Simple, dependency-free SVG icons (no icon library required).

export const IconLeaf = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M5 19c8 0 14-6 14-14 0 0-11-1-14 6-2 4-1 6 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M5 19c1-4 4-8 9-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconWheat = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M12 6c-2-1-3-3-3-3s1 3 3 4M12 6c2-1 3-3 3-3s-1 3-3 4M12 10c-2-1-3-3-3-3s1 3 3 4M12 10c2-1 3-3 3-3s-1 3-3 4M12 14c-2-1-3-3-3-3s1 3 3 4M12 14c2-1 3-3 3-3s-1 3-3 4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconMail = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPhone = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M6 3h3l1.5 4.5L8 9.5a12 12 0 006.5 6.5l2-2.5L21 15v3a2 2 0 01-2.2 2C10.4 19.4 4.6 13.6 4 6.2A2 2 0 016 3z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconInstagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
  </svg>
);

export const IconFacebook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M14 21v-7h2.4l.4-3H14V9c0-.9.3-1.5 1.7-1.5H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.6v7H14z"
      fill="currentColor"
    />
  </svg>
);

export const IconTwitter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 4l7 9.5M20 20l-7.5-10M4 20l6.5-7M13.5 11L20 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconBread = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 14c0-4.5 3.5-8 8-8s8 3.5 8 8c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 9.5l1 4M12 8.5v5M15 9.5l-1 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconArrow = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Note: the site's real logo (barn + bread mark) is now the PNG at
// /assets/logo/ — see Header.jsx / Footer.jsx — not an inline SVG.
