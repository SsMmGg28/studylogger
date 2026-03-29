import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const GRADIENTS = [
  { id: 'none', label: 'Varsayılan', light: '', dark: '' },
  {
    id: 'ocean',
    label: 'Okyanus',
    light: 'linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 50%, #ede9fe 100%)',
    dark: 'linear-gradient(135deg, #0c1929 0%, #0f172a 50%, #150d27 100%)'
  },
  {
    id: 'sunset',
    label: 'Gün Batımı',
    light: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #fde2e2 100%)',
    dark: 'linear-gradient(135deg, #1a150a 0%, #1f0d1a 50%, #1c0c0c 100%)'
  },
  {
    id: 'forest',
    label: 'Orman',
    light: 'linear-gradient(135deg, #d1fae5 0%, #e0f2fe 50%, #dcfce7 100%)',
    dark: 'linear-gradient(135deg, #061211 0%, #0a1520 50%, #071209 100%)'
  },
  {
    id: 'aurora',
    label: 'Aurora',
    light: 'linear-gradient(135deg, #ddd6fe 0%, #bfdbfe 50%, #d1fae5 100%)',
    dark: 'linear-gradient(135deg, #15082e 0%, #081830 50%, #061d13 100%)'
  },
  {
    id: 'cosmic',
    label: 'Kozmik',
    light: 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #e0e7ff 100%)',
    dark: 'linear-gradient(135deg, #1a0533 0%, #2d0a2e 50%, #0d0f33 100%)'
  },
  {
    id: 'rose',
    label: 'Gül',
    light: 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 50%, #faf5ff 100%)',
    dark: 'linear-gradient(135deg, #1c0a0b 0%, #200a16 50%, #160f1f 100%)'
  },
  {
    id: 'mint',
    label: 'Nane',
    light: 'linear-gradient(135deg, #ccfbf1 0%, #cffafe 50%, #d1fae5 100%)',
    dark: 'linear-gradient(135deg, #041f1a 0%, #061b1f 50%, #051a0f 100%)'
  },
  {
    id: 'lavender',
    label: 'Lavanta',
    light: 'linear-gradient(135deg, #e8e0ff 0%, #f0e4ff 50%, #ddd6fe 100%)',
    dark: 'linear-gradient(135deg, #110b24 0%, #160e28 50%, #120a22 100%)'
  }
]

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('studylogger-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [gradient, setGradientState] = useState(() => {
    return localStorage.getItem('studylogger-gradient') || 'none'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('studylogger-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('studylogger-gradient', gradient)
  }, [gradient])

  function toggleTheme() {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }

  function setTheme(t) {
    setThemeState(t)
  }

  function setGradient(g) {
    setGradientState(g)
  }

  const currentGradient = GRADIENTS.find(g => g.id === gradient) || GRADIENTS[0]
  const backgroundStyle = currentGradient.id !== 'none'
    ? { background: theme === 'dark' ? currentGradient.dark : currentGradient.light }
    : {}

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, gradient, setGradient, backgroundStyle, currentGradient }}>
      {children}
    </ThemeContext.Provider>
  )
}
