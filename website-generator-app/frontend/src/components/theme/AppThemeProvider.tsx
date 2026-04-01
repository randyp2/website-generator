"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

type AppThemeProviderProps = {
  children: ReactNode
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
    disableTransitionOnChange
  >
    {children}
  </ThemeProvider>
)
