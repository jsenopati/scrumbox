"use client"

import { useFormStatus } from "react-dom"

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
}

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  )
}
