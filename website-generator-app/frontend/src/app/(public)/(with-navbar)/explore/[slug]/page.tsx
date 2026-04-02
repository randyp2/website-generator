import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Eye, Heart, Share2, SquareArrowOutUpRight, User } from "lucide-react";

import { fetchPublicPortfolio } from "@/lib/api/publicPortfolio";
import { LazyImage } from "@/components/ui/lazy-image";
import PortfolioComments from "./portfolio-comments";

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

interface Props {
  params: Promise<{ slug: string }>;
}

const formatTimeAgo = (iso: string): string => {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (diffMs < month) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(diffMs / year);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const splitTimeAgo = (value: string): { metric: string; suffix: string } => {
  const suffix = " ago";

  if (value.endsWith(suffix)) {
    return {
      metric: value.slice(0, -suffix.length),
      suffix,
    };
  }

  return {
    metric: value,
    suffix: "",
  };
};

const getTemplateLabel = (templateId: string | null): string =>
  templateId
    ? templateId.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Custom Build";

const hashString = (value: string): number =>
  value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);

const getPortfolioMetrics = (slug: string) => {
  const seed = Math.abs(hashString(slug));

  return {
    likes: 120 + (seed % 780),
    shares: 12 + (seed % 140),
    views: 900 + (seed % 9100),
  };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const portfolio = await fetchPublicPortfolio(slug);

  if (!portfolio) {
    return { title: "Portfolio Preview Not Found" };
  }

  return {
    title: `${portfolio.title} | Explore`,
    description: `Preview ${portfolio.title} by ${portfolio.ownerName ?? "an independent creator"} before opening the full portfolio.`,
  };
};

const ExplorePortfolioDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const portfolio = await fetchPublicPortfolio(slug);

  if (!portfolio) {
    notFound();
  }

  const templateLabel = getTemplateLabel(portfolio.templateId);
  const updatedAgo = formatTimeAgo(portfolio.publishedAt);
  const updatedTime = splitTimeAgo(updatedAgo);
  const ownerName = portfolio.ownerName ?? "Anonymous Creator";
  const sectionCount = portfolio.sections.length;
  const metrics = getPortfolioMetrics(portfolio.slug);

  return (
    <section className="min-h-screen bg-background px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_320px]">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="space-y-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to Explore
                </Link>
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                    Portfolio Preview
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {portfolio.title}
                  </h1>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <p className="max-w-[56rem] flex-1 text-sm leading-6 text-muted-foreground sm:text-base">
                      A dedicated preview page for this portfolio. The image mockup sits above a
                      placeholder description section so visitors can scan the concept before
                      opening the full site.
                    </p>
                    <Link
                      href={`/portfolio/${portfolio.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent lg:self-auto"
                    >
                      <SquareArrowOutUpRight className="size-4" />
                      Open Full Portfolio
                    </Link>
                  </div>
                </div>
            </div>

            <article className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b111c]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <div className="ml-2 min-w-0 flex-1 rounded-full border border-white/15 bg-[#070b14] px-3 py-1">
                    <p className="truncate text-xs text-white/75">{`https://portrn/${portfolio.slug}`}</p>
                  </div>
                </div>

                <div className="relative">
                  <LazyImage
                    src={DEFAULT_PREVIEW_IMAGE}
                    fallback="https://placehold.co/1200x675?text=Portfolio+Preview"
                    inView={true}
                    alt={`${portfolio.title} preview`}
                    ratio={16 / 9}
                    className="object-cover"
                    aspectRatioClassName="rounded-none border-0"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="truncate text-base font-semibold text-white sm:text-lg">
                      {portfolio.title}
                    </p>
                    <p className="mt-1 text-sm text-white/75">{ownerName}</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="px-1 py-2 sm:px-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Mockup Description
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              About This Portfolio
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {portfolio.title} is presented as a {templateLabel.toLowerCase()} portfolio by{" "}
              {ownerName}. This section is intentionally structured like a portfolio summary
              mockup, with room for a short positioning statement, project context, and the
              kind of work this creator wants to highlight most.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Replace this placeholder copy with a real narrative about the creator, the
              audience they want to reach, and the proof points that make the portfolio
              worth exploring. For now, it gives the explore page a clean intermediate step
              between the gallery card and the live portfolio.
            </p>
          </article>

            <PortfolioComments />
          </div>

          <aside className="flex h-fit flex-col gap-5 xl:sticky xl:top-24">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                Portfolio Details
              </p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dd className="mt-2 flex w-full items-center gap-3">
                    {portfolio.ownerAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={portfolio.ownerAvatarUrl}
                        alt={ownerName}
                        className="size-10 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <User className="size-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">{ownerName}</span>
                  </dd>
                </div>
                <div>
                  <dd className="mt-1 flex w-full items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>
                      Updated <span className="text-primary">{updatedTime.metric}</span>
                      {updatedTime.suffix}
                    </span>
                  </dd>
                </div>
              </dl>
              <div className="mt-4 h-px w-full bg-border" />
              <div className="mt-4 flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                <div className="flex min-w-0 items-center gap-2">
                  <Heart className="size-4 text-muted-foreground" />
                  <span>{metrics.likes.toLocaleString()}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  <span>{metrics.views.toLocaleString()}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Share2 className="size-4 text-muted-foreground" />
                  <span>{metrics.shares.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                Portfolio Snapshot
              </p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Template</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{templateLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Sections</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {sectionCount} section{sectionCount === 1 ? "" : "s"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase">Slug</dt>
                  <dd className="mt-1 break-all text-sm font-medium text-foreground">
                    {portfolio.slug}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-border pt-6">
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                  Summary
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  This right-side area keeps the core portfolio metadata visible while the
                  preview image and description expand across the left side of the page.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ExplorePortfolioDetailPage;
