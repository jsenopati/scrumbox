"use client"

import { createContext, useContext, useState } from "react"

const LIGHT = "cupcake"
const DARK = "dracula"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
})

export function ThemeProvider({
  children,
  initialTheme = LIGHT,
}: {
  children: React.ReactNode
  initialTheme?: string
}) {
  const [isDark, setIsDark] = useState(initialTheme === DARK)

  function toggleTheme() {
    const next = !isDark
    const themeName = next ? DARK : LIGHT
    localStorage.setItem("theme", themeName)
    document.cookie = `theme=${themeName};path=/;max-age=31536000;SameSite=Lax`
    setIsDark(next)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div data-theme={isDark ? DARK : LIGHT} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
