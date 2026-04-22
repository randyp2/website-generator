"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkBreaks from "remark-breaks"

import { cn } from "@/lib/utils"

interface DescriptionMarkdownProps {
  content: string
  className?: string
}

const markdownComponents: Components = {
  p: ({ className, ...props }) => (
    <p className={cn("text-sm leading-relaxed text-foreground/90", className)} {...props} />
  ),
  h1: ({ className, ...props }) => (
    <h1 className={cn("text-xl font-semibold text-foreground", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("text-base font-semibold text-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("list-disc space-y-1 pl-5 text-sm text-foreground/90", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("list-decimal space-y-1 pl-5 text-sm text-foreground/90", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("text-sm leading-relaxed", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-l-2 border-primary/40 pl-3 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("text-primary underline underline-offset-2", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs text-foreground",
        className,
      )}
      {...props}
    />
  ),
}

export const DescriptionMarkdown = ({
  content,
  className,
}: DescriptionMarkdownProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
