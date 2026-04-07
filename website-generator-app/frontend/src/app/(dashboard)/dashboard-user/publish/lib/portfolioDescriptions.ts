export type PortfolioDescriptionMap = Record<string, string>

const STORAGE_KEY = "publish-portfolio-descriptions-v1"

const isStringRecord = (value: unknown): value is PortfolioDescriptionMap => {
  if (!value || typeof value !== "object") return false

  return Object.values(value).every((item) => typeof item === "string")
}

export const loadPortfolioDescriptions = (): PortfolioDescriptionMap => {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!isStringRecord(parsed)) return {}

    return parsed
  } catch {
    return {}
  }
}

export const savePortfolioDescriptions = (
  descriptions: PortfolioDescriptionMap,
): void => {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(descriptions))
  } catch {
    // Ignore write errors (storage blocked / quota exceeded)
  }
}
