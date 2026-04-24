import type { Portfolio } from "@/types/portfolio"

const toTime = (value: string | null | undefined): number => {
  if (!value) return 0
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

export const compareByUpdatedAtDesc = (a: Portfolio, b: Portfolio): number =>
  toTime(b.updated_at ?? b.created_at) - toTime(a.updated_at ?? a.created_at)
