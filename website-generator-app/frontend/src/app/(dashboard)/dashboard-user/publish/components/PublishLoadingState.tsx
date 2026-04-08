export const PublishLoadingState = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
    <div className="h-12 w-12 rounded-full border-3 border-border border-t-primary" />
    <p className="text-sm text-muted-foreground">
      Loading deployment targets...
    </p>
  </div>
)
