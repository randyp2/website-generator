"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EyeOff } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface UnpublishButtonProps {
  portfolioId: string
  userId: string
}

export const UnpublishButton = ({ portfolioId, userId }: UnpublishButtonProps) => {
  const router = useRouter()
  const [isOwner, setIsOwner] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const checkOwnership = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id === userId) setIsOwner(true)
    }
    checkOwnership()
  }, [userId])

  if (!isOwner) return null

  const handleUnpublish = async () => {
    setIsUnpublishing(true)
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to unpublish")
      router.push("/explore")
    } catch (error) {
      console.error("Failed to unpublish:", error)
      setIsUnpublishing(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Unpublish this portfolio?</span>
        <button
          onClick={handleUnpublish}
          disabled={isUnpublishing}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-red-500/10 px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {isUnpublishing ? "Unpublishing..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isUnpublishing}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-red-500/30 px-4 text-sm font-medium text-red-500 transition-colors hover:cursor-pointer hover:bg-red-500/10 lg:self-auto"
    >
      <EyeOff className="size-4" />
      Unpublish
    </button>
  )
}
