'use client'

import { Moon, Sun, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'dark-red' | 'light'

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check current theme from localStorage or document
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Detect from document classes
      if (document.documentElement.classList.contains('dark-red')) {
        setCurrentTheme('dark-red')
      } else if (document.documentElement.classList.contains('light')) {
        setCurrentTheme('light')
      } else {
        setCurrentTheme('dark')
      }
    }
  }, [])

  const applyTheme = (theme: Theme) => {
    document.documentElement.classList.remove('dark', 'dark-red', 'light')
    if (theme !== 'dark') {
      document.documentElement.classList.add(theme)
    }
    localStorage.setItem('theme', theme)
  }

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    setIsOpen(false)
  }

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg bg-secondary/20 hover:bg-secondary/40 border border-primary/20 flex items-center justify-center transition-colors"
        aria-label="Theme switcher"
      >
        <Palette className="w-5 h-5 text-primary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-secondary/20 transition-colors ${
              currentTheme === 'dark' ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Blue</span>
            {currentTheme === 'dark' && <span className="ml-auto text-primary">✓</span>}
          </button>
          <button
            onClick={() => handleThemeChange('dark-red')}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-secondary/20 transition-colors ${
              currentTheme === 'dark-red' ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-red-600" />
            <span>Dark Red</span>
            {currentTheme === 'dark-red' && <span className="ml-auto text-primary">✓</span>}
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-secondary/20 transition-colors ${
              currentTheme === 'light' ? 'bg-primary/10 text-primary' : 'text-foreground'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
            {currentTheme === 'light' && <span className="ml-auto text-primary">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}