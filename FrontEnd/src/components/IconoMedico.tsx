const trazos = {
  activity: 'M4 12h4l2-5 4 10 2-5h4',
  alertTriangle: 'M12 3 2 21h20L12 3Zm0 7v4m0 3h.01',
  arrowLeft: 'm10 18-6-6 6-6M4 12h16',
  arrowRight: 'm14 6 6 6-6 6M20 12H4',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  building: 'M3 21h18M6 21V8h12v13M9 11h1m4 0h1m-6 4h1m4 0h1M10 21v-3h4M9 8V5h6v3',
  calendar: 'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z',
  camera: 'M4 7h3l1.5-2h7L17 7h3v12H4V7Zm8 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  chart: 'M4 19V9m6 10V5m6 14v-7m4 7H2',
  check: 'm5 12 4 4L19 6',
  chevronDown: 'm7 10 5 5 5-5',
  copy: 'M8 8h11v11H8zM5 16H4V5h11v1',
  clipboard: 'M9 5V3h6v2m-8 0H5v16h14V5h-2M8 10h8m-8 4h8m-8 4h5',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  droplet: 'M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z',
  edit: 'M13.5 6.5 17.5 10.5M4 20l4.2-1 10.6-10.6a2.8 2.8 0 0 0-4-4L4.2 15 4 20Z',
  eye: 'M3 12s3.3-5 9-5 9 5 9 5-3.3 5-9 5-9-5-9-5Zm9 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  eyeOff: 'M4 4l16 16M10.7 10.8a2 2 0 0 0 2.5 2.5M9.5 5.4A11 11 0 0 1 12 5c5.7 0 9 7 9 7a16 16 0 0 1-2.1 3M6.2 6.2C4.2 7.6 3 10 3 12c0 0 3.3 7 9 7a9.6 9.6 0 0 0 3-.5',
  filter: 'M4 5h16l-6.2 7v5l-3.6 2v-7L4 5Z',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v5h5',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 15h8',
  frown: 'M8 10h.01M16 10h.01M8 17s1.5-2 4-2 4 2 4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  home: 'm3 11 9-7 9 7M5 10v10h5v-6h4v6h5V10',
  idCard: 'M4 6h16v12H4zM8 10h3m-3 4h5m3-4h1m-1 4h1',
  info: 'M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  ivBag: 'M9 3h6v3m-7 0h8v12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6Zm4 0v3m-2 4h2m-2 4h2m-1 7v1',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  link: 'm10 13 4-4m-6 8H6a4 4 0 0 1 0-8h3m6-2h3a4 4 0 0 1 0 8h-2',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm6 4v2',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  meh: 'M8 10h.01M16 10h.01M8 16h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  microphone: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0m-7 7v3m-4 0h8',
  minusSquare: 'M5 5h14v14H5V5Zm3 7h8',
  moreVertical: 'M12 5h.01M12 12h.01M12 19h.01',
  pause: 'M8 5v14M16 5v14',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  pill: 'm8 16 8-8a4.25 4.25 0 0 0-6-6l-6 6a4.25 4.25 0 0 0 6 6l8-8M9 7l6 6',
  plusCircle: 'M12 8v8m-4-4h8m5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  refresh: 'M20 7v5h-5M4 17v-5h5m10.5-3A8 8 0 0 0 6 6l-2 3m.5 6A8 8 0 0 0 18 18l2-3',
  send: 'm3 11 18-8-8 18-2-7-8-3Zm8 3 10-11',
  save: 'M5 3h12l2 2v16H5V3Zm3 0v6h8V3M8 21v-8h8v8',
  search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  shield: 'M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Zm-3 9 2 2 4-4',
  smartphone: 'M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5M11 4h2M12 17v.01',
  smile: 'M8 10h.01M16 10h.01M8 15s1.5 2 4 2 4-2 4-2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  sparkles: 'm12 3 1.4 4.1 4.1 1.4-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Zm6 10 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z',
  stethoscope: 'M6 3v5a4 4 0 0 0 8 0V3M6 3H4m10 0h2m-6 9v2a4 4 0 0 0 8 0v-1m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  stop: 'M7 7h10v10H7Z',
  thermometer: 'M14 14.8V5a4 4 0 0 0-8 0v9.8a6 6 0 1 0 8 0ZM10 6v10m-2 1a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
  trendDown: 'm4 8 5 5 4-4 7 7m-5 0h5v-5',
  trendUp: 'm4 16 5-5 4 4 7-8m-5 0h5v5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0m1-10a3 3 0 1 0 0-6m1 10a6 6 0 0 1 4 6',
  whatsapp: 'M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1',
  volume: 'M4 10v4h4l5 4V6L8 10H4Zm12-1a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12',
  x: 'M6 6l12 12M18 6 6 18',
} as const

export type NombreIconoMedico = keyof typeof trazos

interface IconoMedicoProps {
  className?: string
  nombre: NombreIconoMedico
  strokeWidth?: number
}

function IconoMedico({ className = 'h-5 w-5', nombre, strokeWidth = 1.8 }: IconoMedicoProps) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={strokeWidth}
      viewBox='0 0 24 24'
    >
      <path d={trazos[nombre]} />
    </svg>
  )
}

export default IconoMedico
