export const ENVS = {
  DEV: {
    label: 'DEV',
    host:  'https://pcp-dev.e-connectsolutions.com',
    color: '#3b82f6',
    tw: {
      dot:    'bg-blue-400',
      text:   'text-blue-300',
      border: 'border-blue-500/20',
      badge:  'bg-blue-500/15 text-blue-300 border border-blue-500/30',
      active: 'bg-blue-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.5)]',
      glow:   '0 0 80px rgba(59,130,246,0.18)',
    },
  },
  TEST: {
    label: 'TEST',
    host:  'https://pcp-test.e-connectsolutions.com',
    color: '#f59e0b',
    tw: {
      dot:    'bg-amber-400',
      text:   'text-amber-300',
      border: 'border-amber-500/20',
      badge:  'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      active: 'bg-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.5)]',
      glow:   '0 0 80px rgba(245,158,11,0.18)',
    },
  },
  UAT: {
    label: 'UAT',
    host:  'https://pcpuat.e-connectsolutions.com',
    color: '#a78bfa',
    tw: {
      dot:    'bg-violet-400',
      text:   'text-violet-300',
      border: 'border-violet-500/20',
      badge:  'bg-violet-500/15 text-violet-300 border border-violet-500/30',
      active: 'bg-violet-600 text-white shadow-[0_0_18px_rgba(167,139,250,0.5)]',
      glow:   '0 0 80px rgba(167,139,250,0.18)',
    },
  },
  PROD: {
    label: 'PROD',
    host:  'https://digipb.punjab.gov.in',
    color: '#ef4444',
    tw: {
      dot:    'bg-red-400',
      text:   'text-red-300',
      border: 'border-red-500/20',
      badge:  'bg-red-500/15 text-red-300 border border-red-500/30',
      active: 'bg-red-700 text-white shadow-[0_0_18px_rgba(239,68,68,0.55)]',
      glow:   '0 0 80px rgba(239,68,68,0.2)',
    },
  },
}

export const ENV_KEYS = Object.keys(ENVS)
