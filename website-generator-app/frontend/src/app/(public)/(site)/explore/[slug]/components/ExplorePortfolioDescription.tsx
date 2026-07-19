import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

import { getPortfolioDescription } from "../explore-portfolio-detail.utils";
import type { ExplorePortfolioDetail } from "../explore-portfolio-detail.types";

interface ExplorePortfolioDescriptionProps {
  portfolio: ExplorePortfolioDetail;
  linksEnabled?: boolean;
}

const markdownComponents: Components = {
  p: ({ ...props }) => (
    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base" {...props} />
  ),
  h1: ({ ...props }) => (
    <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h2: ({ ...props }) => (
    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground" {...props} />
  ),
  h3: ({ ...props }) => (
    <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground sm:text-base" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground sm:text-base" {...props} />
  ),
  li: ({ ...props }) => <li className="leading-7" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="mt-4 border-l-2 border-primary/40 pl-3 italic text-sm leading-7 text-muted-foreground sm:text-base"
      {...props}
    />
  ),
  a: ({ ...props }) => (
    <a className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
  code: ({ ...props }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground" {...props} />
  ),
  pre: ({ ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs text-foreground"
      {...props}
    />
  ),
};

export const ExplorePortfolioDescription = ({
  portfolio,
  linksEnabled = true,
}: ExplorePortfolioDescriptionProps) => {
  const markdownDescription = portfolio.description?.trim() ?? "";
  const hasMarkdownDescription = markdownDescription.length > 0;
  const descriptionParagraphs = getPortfolioDescription(portfolio);
  const components: Components = linksEnabled
    ? markdownComponents
    : {
        ...markdownComponents,
        a: ({ children }) => (
          <span className="text-primary underline underline-offset-2">
            {children}
          </span>
        ),
      };

  return (
    <article className="px-1 py-2 sm:px-2">
      <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
        Portfolio Description
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        About This Portfolio
      </h2>
      {hasMarkdownDescription ? (
        <div className="mt-4 space-y-3">
          <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
            {markdownDescription}
          </ReactMarkdown>
        </div>
      ) : (
        descriptionParagraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`} className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {paragraph}
          </p>
        ))
      )}
    </article>
  );
};
