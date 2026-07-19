import Image from "next/image";

interface PortfolioCardScreenshotProps {
  screenshotUrl: string | null;
  portfolioTitle: string;
}

/** Shows a real portfolio capture or a clear pending-capture state. */
export const PortfolioCardScreenshot = ({
  screenshotUrl,
  portfolioTitle,
}: PortfolioCardScreenshotProps) => {
  if (!screenshotUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/40 px-8 text-center">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            We&apos;re retrieving your screenshot.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Please refresh or try again in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Image
        src={screenshotUrl}
        alt={`${portfolioTitle} preview`}
        fill
        unoptimized
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
      <div className="absolute -top-20 right-[-20%] h-40 w-40 rounded-full bg-background/40 blur-3xl" />
    </>
  );
};
