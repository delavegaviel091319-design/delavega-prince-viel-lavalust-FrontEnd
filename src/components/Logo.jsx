export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="url(#g)" />
      <path d="M9 12l7-4 7 4v8l-7 4-7-4z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12l7 4 7-4M16 16v8" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  )
}
