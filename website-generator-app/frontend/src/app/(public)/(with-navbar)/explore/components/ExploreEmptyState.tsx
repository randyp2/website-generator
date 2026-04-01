import { SearchX } from "lucide-react"

interface ExploreEmptyStateProps {
  hasQuery?: boolean
}

export const ExploreEmptyState = ({
  hasQuery = false,
}: ExploreEmptyStateProps) => {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasQuery ? "No matching portfolios" : "No portfolios yet"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasQuery
          ? "Try a different title, creator name, slug, or template search."
          : "Published portfolios will appear here. Be the first to share yours!"}
      </p>
    </div>
  )
}
