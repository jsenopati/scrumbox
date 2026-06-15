import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/context/theme"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ScrumBox - Project Tracker",
  description: "Lightweight project tracking for executive reporting",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const savedTheme = cookieStore.get("theme")?.value ?? "nord"

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-base-200 text-base-content`}
      >
        <ThemeProvider initialTheme={savedTheme}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
