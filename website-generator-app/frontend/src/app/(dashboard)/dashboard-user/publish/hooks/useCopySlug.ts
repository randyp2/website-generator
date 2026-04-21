"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseCopySlugResult {
  copiedSlug: string | null
  copySlug: (slug: string, explicitUrl?: string | null) => Promise<void>
}

const COPY_FEEDBACK_MS = 2000

export const useCopySlug = (): UseCopySlugResult => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const copySlug = useCallback(
    async (slug: string, explicitUrl?: string | null): Promise<void> => {
      const trimmedExplicit = explicitUrl?.trim()
      const urlToCopy = trimmedExplicit
        ? trimmedExplicit
        : `${window.location.origin}/portfolio/${slug}`
      await navigator.clipboard.writeText(urlToCopy)
      setCopiedSlug(slug)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopiedSlug(null), COPY_FEEDBACK_MS)
    },
    [],
  )

  return { copiedSlug, copySlug }
}
