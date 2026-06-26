"use client"

import { IoSunny, IoMoon } from "react-icons/io5"
import { useTheme } from "@/context/theme"

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-sm btn-circle"
      title="Toggle dark mode"
    >
      <input type="checkbox" checked={isDark} onChange={toggleTheme} />
      <IoSunny className="swap-off size-5" />
      <IoMoon className="swap-on size-5" />
    </label>
  )
}
