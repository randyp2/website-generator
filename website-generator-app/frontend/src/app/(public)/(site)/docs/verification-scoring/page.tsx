import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verification scoring",
  description:
    "How PortRN calculates verification progress and how the scoring model is being refined.",
};

const scoreBands = [
  ["0–20", "Unverified or supported only by weak evidence"],
  ["21–40", "Basic evidence support"],
  ["41–60", "Intermediate evidence support"],
  ["61–80", "Advanced evidence support"],
  ["81–100", "Expert evidence support with reviewed work"],
];

const signalWeights = [
  ["Dependency match", "1.00"],
  ["AI document match", "1.00"],
  ["Repository topic", "Discovery only"],
  ["Repository name", "Discovery only"],
  ["Repository description", "Discovery only"],
  ["Language plus text", "0.48"],
];

const evidenceDepthCaps = [
  ["Below 0.85", "80"],
  ["0.85", "80"],
  ["0.875", "85"],
  ["0.90", "90"],
  ["0.925", "95"],
  ["0.95+", "100"],
];

const authorshipWeights = [
  ["Five direct commits across multiple days", "1.00"],
  ["Two or more direct commits across multiple days", "0.90"],
  ["Multiple direct commits on one day", "0.85"],
  ["One direct commit", "0.75"],
  ["Merge-only activity, owned repository", "0.65"],
  ["No attributed commits, owned repository", "0.60"],
  ["Merge-only activity, fork", "0.45"],
  ["No attributed commits, fork", "0.30"],
  ["GitHub data unavailable or scan limit reached", "1.00"],
];

const calibrationRows = [
  ["Three recognized claims, no evidence", "0", "Recognition alone earns no points"],
  ["Untouched fork with dependency match", "20", "Remains Unverified because authorship is weak"],
  ["Owned repository with merge-only activity", "54", "Partial contribution credit"],
  ["Repository with one direct commit", "61", "Direct authorship reaches Advanced"],
  ["Several direct commits on one day", "66", "Concentrated direct contribution"],
  ["Several direct commits across multiple days", "68", "Sustained direct contribution"],
  ["Active repository with five direct commits", "71", "Strong single repository"],
  ["Authorship API unavailable", "71", "No outage penalty"],
  ["Two-year-old active repository", "42", "Gradual recency decay"],
  ["Three active repositories", "80", "Repeated independent usage"],
  ["Same project copied into two repositories", "71", "Copy adds no score"],
  ["Primary plus a small derivative", "76", "Quantity adds gradual credit"],
  ["Primary plus a meaningful derivative", "77", "Novel work adds partial credit"],
  ["Primary plus a substantial derivative", "78", "Mostly distinct work approaches full credit"],
  ["Primary plus a diverged lineage fork", "79", "Fork adds 0.85 independence weight"],
  ["Two independent active repositories", "79", "Independent work approaches the connector cap"],
  ["One reviewed artifact at 0.95 depth", "90", "Strong reviewed evidence reaches Expert"],
  ["Five repository descriptions", "0", "Descriptions add no verification points"],
  ["Five repository name matches", "0", "Names add no verification points"],
  ["Five repository topic matches", "0", "Topics add no verification points"],
  ["Same reviewed upload submitted twice", "90", "Duplicate adds no score"],
  ["Five reviewed artifacts at 0.95 depth", "100", "Expert-range evidence"],
  ["Four claims, only one evidenced", "31", "Coverage dampens the profile score"],
];

const repositoryPairCalibrationRows = [
  ["Exact snapshot control", "1.000", "Duplicate", "Duplicate", "71"],
  ["Same repository across revisions", "0.938", "Duplicate", "Duplicate by identity", "71"],
  ["Documented JavaFX derivative", "0.367", "Derivative", "Independent", "79"],
  ["Maintained TON fork", "0.273", "Derivative", "Derivative at 0.85 credit", "79"],
  ["Turborepo across revisions", "0.836", "Duplicate", "Duplicate by identity", "71"],
  ["Independent Python frameworks", "0.000", "Independent", "Independent", "79"],
  ["Independent Java projects", "0.000", "Independent", "Independent", "79"],
  ["Independent JS tooling", "0.016", "Independent", "Independent", "79"],
  ["Independent app templates", "0.023", "Independent", "Independent", "79"],
  ["Cross-language projects", "0.000", "Independent", "Independent", "79"],
];

/** Accented panel that groups related equations. */
const FormulaBlock = ({ children }: { children: ReactNode }) => (
  <div className="mt-5 space-y-2.5 overflow-x-auto rounded-xl border border-border border-l-2 border-l-primary/60 bg-muted/25 py-5 pl-6 pr-5">
    {children}
  </div>
);

/** One equation line. `lead` enlarges and emphasizes the headline result. */
const Eq = ({ children, lead = false }: { children: ReactNode; lead?: boolean }) => (
  <div
    className={
      lead
        ? "flex flex-wrap items-baseline gap-x-2 font-mono text-lg font-semibold leading-relaxed text-foreground sm:text-xl"
        : "flex flex-wrap items-baseline gap-x-2 font-mono text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
    }
  >
    {children}
  </div>
);

/** Highlighted term (result variable or key value) rendered in the brand color. */
const R = ({ children }: { children: ReactNode }) => (
  <span className="font-medium text-primary">{children}</span>
);

/** Superscript sized relative to the surrounding equation. */
const Sup = ({ children }: { children: ReactNode }) => (
  <sup className="text-[0.65em]">{children}</sup>
);

/** Emphasized inline phrase inside prose. */
const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

/** Maps a 0–100 score onto a red (low) to green (high) heat scale. */
const scoreColorClass = (score: number): string => {
  if (score < 50) return "text-rose-600 dark:text-rose-400";
  if (score < 60) return "text-amber-600 dark:text-amber-400";
  if (score < 70) return "text-yellow-600 dark:text-yellow-400";
  if (score < 80) return "text-lime-600 dark:text-lime-400";
  if (score < 90) return "text-green-600 dark:text-green-400";
  return "text-emerald-600 dark:text-emerald-400";
};

/** Score value colored by magnitude. Non-numeric values render unstyled. */
const Score = ({ value }: { value: string }) => {
  const numeric = Number.parseInt(value, 10);
  return (
    <span className={Number.isNaN(numeric) ? "" : `font-medium ${scoreColorClass(numeric)}`}>
      {value}
    </span>
  );
};

const RECENCY_LAMBDA = 0.00095;

/**
 * Static, theme-aware plot of the recency decay curve. Points are computed from
 * the real coefficient, so the chart cannot drift from the documented formula.
 */
const RecencyDecayChart = () => {
  const width = 640;
  const height = 300;
  const margin = { top: 16, right: 20, bottom: 58, left: 66 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxDays = 1460; // four years

  const xScale = (days: number) => margin.left + (days / maxDays) * innerWidth;
  const yScale = (recency: number) => margin.top + (1 - recency) * innerHeight;
  const baseline = yScale(0);

  const curve = Array.from({ length: 121 }, (_, index) => {
    const days = (maxDays / 120) * index;
    return [xScale(days), yScale(Math.exp(-RECENCY_LAMBDA * days))] as const;
  });
  const linePath = curve
    .map(([px, py], index) => `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xScale(maxDays).toFixed(1)} ${baseline.toFixed(1)} L ${xScale(0).toFixed(1)} ${baseline.toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [
    { days: 0, label: "today" },
    { days: 365, label: "1y" },
    { days: 730, label: "2y" },
    { days: 1095, label: "3y" },
    { days: 1460, label: "4y" },
  ];
  const halfLifeX = xScale(730);
  const halfLifeY = yScale(0.5);

  return (
    <figure className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted/20 px-4 py-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label="Recency multiplier decaying from 1.0 at day zero to about 0.5 at two years and continuing to fade with no hard cutoff."
      >
        <defs>
          <linearGradient id="recencyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
            <text
              x={margin.left - 10}
              y={yScale(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <text
            key={`x-${tick.days}`}
            x={xScale(tick.days)}
            y={baseline + 22}
            textAnchor="middle"
            fontSize={11}
            fill="var(--muted-foreground)"
          >
            {tick.label}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={margin.left + innerWidth / 2}
          y={baseline + 44}
          textAnchor="middle"
          fontSize={12}
          fontWeight={500}
          fill="var(--muted-foreground)"
        >
          Age of evidence
        </text>
        <text
          transform={`rotate(-90 16 ${margin.top + innerHeight / 2})`}
          x={16}
          y={margin.top + innerHeight / 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight={500}
          fill="var(--muted-foreground)"
        >
          Recency multiplier
        </text>

        <path d={areaPath} fill="url(#recencyFill)" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} />

        {/* Half-life marker */}
        <line
          x1={margin.left}
          x2={halfLifeX}
          y1={halfLifeY}
          y2={halfLifeY}
          stroke="var(--primary)"
          strokeWidth={1}
          strokeDasharray="4 4"
          strokeOpacity={0.7}
        />
        <line
          x1={halfLifeX}
          x2={halfLifeX}
          y1={halfLifeY}
          y2={baseline}
          stroke="var(--primary)"
          strokeWidth={1}
          strokeDasharray="4 4"
          strokeOpacity={0.7}
        />
        <circle cx={halfLifeX} cy={halfLifeY} r={4.5} fill="var(--primary)" />
        <circle cx={xScale(0)} cy={yScale(1)} r={4.5} fill="var(--primary)" />
        <text
          x={halfLifeX + 10}
          y={halfLifeY - 26}
          fontSize={12}
          fontWeight={600}
          fill="var(--foreground)"
        >
          ~2-year half-life
        </text>
        <text
          x={halfLifeX + 10}
          y={halfLifeY - 11}
          fontSize={11}
          fill="var(--muted-foreground)"
        >
          recency = 0.50
        </text>
      </svg>
      <figcaption className="mt-3 text-xs leading-6 text-muted-foreground">
        Recency multiplier as a single piece of evidence ages. Fresh evidence sits
        at 1.0, drops to about 0.5 near two years, and keeps fading gradually with no
        hard cutoff.
      </figcaption>
    </figure>
  );
};

const VerificationScoringPage = () => {
  return (
    <article>
      <header className="border-b border-border pb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Public documentation
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Verification scoring
        </h1>
        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          This is the reasoning behind the number on your skill claims: what it
          measures, and every decision I made turning evidence into a score. I
          wrote it in the order I actually think about the problem, so you can
          follow the whole pipeline from a bare claim to a verified one.
        </p>
      </header>

      <div className="mt-12 space-y-14">
        <section
          id="why-this-exists"
          className="scroll-mt-28 rounded-2xl border border-primary/40 bg-primary/[0.04] p-6 shadow-[0_0_40px_-12px_color-mix(in_oklab,var(--primary)_75%,transparent)] sm:p-8"
        >
          <h2 className="text-2xl font-semibold">Why this exists</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Verification is one of the core products of PortRN. Anyone can put a
            skill on a resume, and in a world where claims are cheap to make and hard
            to check, I did not want PortRN to be just another place to showcase what
            you say you can do. I wanted it to be a place where you can actually back
            it up.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            That goal shaped how I built the scoring. I wanted the math to be as
            deterministic as I could make it. If I handed the whole judgment to an
            LLM, two problems show up: the same evidence can score differently from
            one run to the next, and whatever bias the model carries quietly leaks
            into the result. Neither is acceptable for something that is meant to be
            trusted. So the scoring itself is deterministic. Once the inputs are
            fixed, the same evidence always produces the same number, and every point
            traces back to a rule I can explain.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            But determinism has a ceiling. A fixed formula is good at counting things
            and bad at judgment, and there are plenty of signals that clearly point to
            someone being good at what they do that no simple formula will ever catch.
            For instance, two projects can both list the same dependency, but one is a
            throwaway starter and the other is a real application with thoughtful
            structure, tests, and error handling. To a counter they look identical. To
            anyone actually reading the code, they obviously are not.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            That gap is why the system as a whole is a hybrid rather than pure math.
            The scoring stays deterministic, but I let a model weigh in on one thing:
            how much a piece of work you upload genuinely demonstrates a skill. That
            judgment becomes an input the formulas consume, so it is the one part that
            is not itself a fixed rule. And even there it is bounded: it can only move
            you within a capped range. So the model can recognize depth the formula
            would miss, but it never gets to run the score on its own.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Below I walk through the choices I made and why, roughly in the order the
            system applies them.
          </p>
        </section>

        <section id="what-the-score-means" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">What the score means</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Before I get into how the number is built, here is what it actually
            represents. The score runs from 0 to 100 and tracks one thing: how far
            along you are in backing a skill claim with real evidence. It is not a
            grade of how good you are, and it is not the odds that you are telling the
            truth. Think of it as a progress meter.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Every claim starts at 0. Recognizing a canonical skill name only makes
            the claim eligible for evidence matching; it does not verify the claim or
            award points. Every point from 1 to 100 has to come from linked scoring
            evidence.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {scoreBands.map(([score, meaning]) => (
                  <tr key={score} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 font-mono">
                      <Score value={score} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="where-claims-start" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Where every claim starts</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            The first decision was where a claim begins before any evidence exists.
            Early on I let the source change that starting point, so a claim imported
            from a connected account started higher than one you typed in by hand. I
            took that out. A claim you typed and a claim pulled from your resume are
            both just you saying something about yourself, and neither should be worth
            verification points until there is proof. So every claim now starts at
            <Strong> zero</Strong>, regardless of where it came from or whether its name
            is recognized.
          </p>
          <FormulaBlock>
            <Eq><R>recognized active claim without evidence</R> = 0</Eq>
            <Eq><R>unresolved claim</R> = 0 and cannot score evidence yet</Eq>
            <Eq><R>rejected claim</R> = excluded</Eq>
            <Eq>manual / resume / imported source = <R>0</R> until evidence is linked</Eq>
          </FormulaBlock>
          <p className="mt-4 leading-7 text-muted-foreground">
            Recognition still matters, but it is a routing step rather than proof.
            Whatever wording gets extracted is matched against a canonical skill name
            or alias. Until it resolves, the claim stays visible but evidence cannot be
            scored against it. I keep the skill catalog versioned in JSON and apply it
            through immutable database migrations, so adding a new alias can also
            repair claims that were stuck as unresolved. The catalog currently
            recognizes common AWS service abbreviations, Supabase, Flyway, RAG
            pipelines, and LLM API integration terms, and it grows as I find gaps.
          </p>
        </section>

        <section id="what-counts-as-evidence" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">What counts as evidence</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Once a claim is recognized, the only thing that earns score is evidence.
            But not all evidence is worth the same, and deciding what each
            kind is worth was one of the bigger calls I made. I start by splitting
            every signal into two separate questions.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Match confidence</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Does this artifact actually relate to the claim? This is what decides
                whether an evidence link gets created in the first place.
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Evidence depth</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                How much does it genuinely demonstrate the skill? This is what drives
                score strength, reviewed status, and how far the cap can rise.
              </p>
            </div>
          </div>

          <p className="mt-6 leading-7 text-muted-foreground">
            On top of that, each type of signal carries its own weight, based on how
            directly it proves you used the skill rather than just being near it. A
            dependency in your build file is a deliberate technical choice, so it
            counts at full strength. A language-plus-text match is broad and easy to
            inflate, so it counts for less than half. An AI-reviewed upload also passes
            through at full strength, but for a different reason: the depth score has
            already captured how much the work demonstrates, so there is nothing left
            for the weight to discount.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signal</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current weight</th>
                </tr>
              </thead>
              <tbody>
                {signalWeights.map(([signal, weight]) => (
                  <tr key={signal} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{signal}</td>
                    <td className="px-4 py-3 font-mono">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl leading-7 text-muted-foreground">
            The weight is just a multiplier on the signal&apos;s confidence or depth,
            so the easiest way to see what it means is to hold the input fixed. Say
            three different signals all land at 0.85. Here is what each one actually
            contributes:
          </p>
          <FormulaBlock>
            <Eq>dependency match: 0.85 · 1.00 = <R>0.85</R></Eq>
            <Eq>AI document match: 0.85 · 1.00 = <R>0.85</R></Eq>
            <Eq>language + text: 0.85 · 0.48 = <R>0.41</R></Eq>
          </FormulaBlock>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Same input, less than half the contribution for the weakest signal. That
            gap is the whole reason the weights exist: a broad language sighting has to
            stack up much higher to move your score as far as a single dependency or a
            reviewed upload.
          </p>

          <p className="mt-6 leading-7 text-muted-foreground">
            A repository topic, name, or description can help me find work that
            relates to a claim, but you control all three, so I do not let them move
            your score at all. They stay attached as provenance and nothing more.
          </p>
        </section>

        <section id="keeping-evidence-honest" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Keeping evidence honest</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            The hard part of a system like this is not rewarding real work. It is
            refusing to reward the same work twice, or work that is not really yours.
            Most of the decisions in this section exist to close those gaps.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Counting each source once</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            Before I count anything, I group evidence that comes from the same
            underlying source and keep only the strongest signal from each group. An
            upload with a matching storage fingerprint and a repository whose sampled
            source heavily overlaps another cannot each create a separate scoring
            position for what is really one piece of work.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              Uploaded artifacts use the storage-reported SHA-256 checksum when
              available, then the verified ETag, then the upload ID as a safe fallback.
            </li>
            <li>
              Comparable GitHub repositories keep their own numeric ID so content
              divergence can be measured. When a reliable fingerprint is unavailable,
              resolved forks conservatively fall back to the root repository ID.
            </li>
            <li>
              Semantic comparison is limited to the fifteen most recently updated
              repositories during a sync. Each repository contributes at most eight
              eligible files across distinct two-level source areas, with a 200 KB
              per-file limit and a 600 KB known-size sampling budget. Unused slots are
              filled by the strongest remaining source candidates.
            </li>
            <li>
              Eligible inputs include source code, tests, database migrations, and
              important build configuration. Documentation, lock files, dependencies,
              generated output, CI metadata, editor configuration, caches, binaries,
              and media are excluded. Identical Git blobs mirrored within one
              repository can occupy only one sample position.
            </li>
            <li>
              Selected files are tokenized into five-token shingles. SHA-256 hashes
              produce a deterministic 128-entry bottom-k sketch. Formatting, line
              endings, file order, and file renames do not create extra credit. Only
              hashes, counts, and sampled paths are stored with evidence, not another
              copy of the sampled source.
            </li>
            <li>
              A repository needs at least forty distinct shingles and at least 90%
              estimated overlap with every independent source group already in the
              cluster. This complete-link rule prevents a chain of loosely related
              projects from being collapsed through one intermediate repository.
            </li>
            <li>
              Similarity grouping changes evidence independence only. It does not
              label a user or repository as fraudulent, and unavailable fingerprint
              data never creates a duplicate classification.
            </li>
            <li>
              Historical evidence keeps its provider and external ID, because old
              uploads cannot be fingerprinted retroactively without reading them again.
            </li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold">Giving derivatives partial credit</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            Grouping duplicates raised a fairer question: what about a project that is
            clearly derived from another but has real new work in it? Collapsing it to
            nothing felt wrong, so I treat similarity as an estimate of how
            independently a repository supports the same skill, not a quality
            judgment. Derivatives stay as separate evidence positions and earn gradual
            credit for the source content that is genuinely novel.
          </p>
          <FormulaBlock>
            <Eq>shared content ≤ 60% → independence weight <R>1.00</R></Eq>
            <Eq>shared content 65% → independence weight <R>0.875</R></Eq>
            <Eq>shared content 70% → independence weight <R>0.75</R></Eq>
            <Eq>shared content 80% → independence weight <R>0.50</R></Eq>
            <Eq>shared content 85% → independence weight <R>0.375</R></Eq>
            <Eq>shared content ≥ 90% → grouped as one source</Eq>
            <Eq lead><R>weight</R> = 0.25 + 0.75 · ((0.90 − shared) / 0.30)</Eq>
            <Eq>resolved lineage fork: <R>weight</R> = min(weight, 0.85)</Eq>
          </FormulaBlock>
          <p className="mt-4 leading-7 text-muted-foreground">
            Within a related family, the repository with the largest sampled token
            count becomes the primary, with authorship and recency as tie-breakers.
            Everything else is compared directly against that primary, so similarity
            chains cannot quietly reduce unrelated work. Formatting, renames,
            generated output, dependency folders, documentation, and lock-file changes
            never manufacture novelty. I treat resolved lineage as a conservative
            prior rather than permanent duplication: a fork below 90% similarity stays
            a separate position, but its independence weight cannot exceed 0.85.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Discounting work you did not do</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            A repository sitting in your account is not the same as a repository you
            built. So I multiply repository evidence by an authorship weight based on
            the commits GitHub attributes to your account. The sync reads at most five
            matching commits from each of the thirty most recently updated
            repositories, separates direct commits from merges, and counts distinct
            contribution days. Uploads and non-repository evidence use a weight of
            1.00.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Authorship result</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight</th>
                </tr>
              </thead>
              <tbody>
                {authorshipWeights.map(([result, weight]) => (
                  <tr key={result} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{result}</td>
                    <td className="px-4 py-3 font-mono">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            I was careful to make the failure modes forgiving. API errors and scan
            limits never reduce a score. GitHub may report no matching commits when
            work used an unlinked email or a different identity, so zero-commit results
            use gradual floors instead of excluding a repository outright. AI-assisted
            commits are allowed, and I make no attempt to guess which tools wrote the
            code or to infer authorship from commit messages.
          </p>
        </section>

        <section id="turning-evidence-into-a-score" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Turning evidence into a score</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Now the math. Once I have the independent signals for a claim, each with
            its own strength, I combine them into a single number. I wanted three
            properties: more evidence should always help, repeated evidence should
            help less each time, and no pile of weak evidence should ever fake its way
            to the top.
          </p>
          <FormulaBlock>
            <Eq><R>connector strength</R> = confidence · weight · authorship · independence · recency</Eq>
            <Eq><R>reviewed strength</R> = evidence depth · weight · recency</Eq>
            <Eq><R>effective evidence</R> = Σ ( signal strength · 0.75<Sup>rank</Sup> )</Eq>
            <Eq><R>support</R> = 1 − exp( −3.50 · effective evidence )</Eq>
            <Eq><R>proof progress</R> = support<Sup>2.80</Sup></Eq>
            <Eq lead><R>claim score</R> = cap · proof progress</Eq>
          </FormulaBlock>
          <p className="mt-4 leading-7 text-muted-foreground">
            I sort the signals strongest first and keep the top ten. Each additional
            one is discounted geometrically, so the second matters less than the first
            and the <Strong>tenth barely registers</Strong>, which is what stops someone from stacking
            near-duplicate signals into a high score. That discounted sum becomes
            effective evidence. The support and proof-progress curves work together as
            a threshold: weak proximity stays low, while direct authored work rises
            quickly into the meaningful score bands. Because the score starts at zero,
            the curve uses the full available range instead of adding a small lift
            above an automatic midpoint. Piling on marginal signals still hits
            diminishing returns fast.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            This is not the old score with fifty points subtracted. Moving the
            baseline to zero required recalibrating the support curve to use the full
            available cap. In the current calibration, an untouched fork scores 20,
            one repository with a confirmed direct commit scores 61, a strongly
            authored active repository scores 71, and one strong reviewed artifact
            scores 90. That keeps weak evidence Unverified while allowing one real
            project to register as meaningful proof.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Old evidence fades</h3>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            One more factor sits inside every signal&apos;s strength: how old it is. I
            did not want a great project from six years ago to count exactly the same
            as the same work shipped last month. But I also did not want a hard cutoff
            where evidence suddenly stops counting on some arbitrary day, because that
            would punish people for the timing of their work rather than the work
            itself. So age applies as a smooth exponential decay.
          </p>
          <FormulaBlock>
            <Eq lead>
              <R>recency</R> = exp( −0.00095 · age in days )
            </Eq>
          </FormulaBlock>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            That coefficient works out to roughly a <Strong>two-year half-life</Strong>.
            Evidence about two years old counts for about half of what the same
            evidence would fresh, and it keeps fading gradually from there instead of
            dropping off a cliff. Anything dated today, or somehow in the future, sits
            at a clean 1.0 and loses nothing.
          </p>
          <RecencyDecayChart />
        </section>

        <section id="the-expert-tier" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">The expert tier</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            There is a ceiling on all of this. Anything proven only by
            machine-detected connector signals <Strong>max out at 80</Strong>, and
            that is deliberate. Connector signals can be gamed, and I did not want a
            well-tagged GitHub account to reach the same place as work that was
            actually reviewed.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            The range above 80 is the one place the hybrid approach from the top of
            this page actually shows up. To unlock it, you upload work and a model
            assesses how deeply it demonstrates the skill. That depth score feeds a
            fixed formula that gradually raises the ceiling from 80 toward 100.
          </p>
          <FormulaBlock>
            <Eq><R>review progress</R> = clamp( (evidence depth − 0.85) / 0.10, 0, 1 )</Eq>
            <Eq lead><R>claim cap</R> = 80 + round( 20 · review progress )</Eq>
          </FormulaBlock>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence depth</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available cap</th>
                </tr>
              </thead>
              <tbody>
                {evidenceDepthCaps.map(([depth, cap]) => (
                  <tr key={depth} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 font-mono">{depth}</td>
                    <td className="px-4 py-3 font-mono">
                      <Score value={cap} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            The cap is only headroom. Even once the ceiling rises, evidence strength
            and breadth still decide how much of it you actually earn.
          </p>
        </section>

        <section id="profile-rollup" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">From one claim to the whole profile</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Everything so far scores a single claim. Your overall number rolls those
            together, and I had to be careful here. I average the evidence score only
            over the claims that actually have evidence, so an unsupported skill never
            reduces an individual claim score. Then I apply breadth as a gentle profile
            multiplier. Unsupported claims can lower the overall profile score, but
            they cannot erase the strength shown on an evidenced claim.
          </p>
          <FormulaBlock>
            <Eq><R>mean evidenced score</R> = total claim scores / evidenced claims</Eq>
            <Eq><R>coverage</R> = evidenced claims / recognized claims</Eq>
            <Eq lead><R>overall</R> = mean evidenced score · coverage<Sup>0.60</Sup></Eq>
          </FormulaBlock>
          <p className="mt-4 leading-7 text-muted-foreground">
            The effect I was after: one real piece of evidence creates visible
            progress, while people who back more of their claims are still rewarded for
            the breadth.
          </p>
        </section>

        <section id="how-i-tested-it" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">How I tested it</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            A scoring model is only as trustworthy as the cases you check it against.
            So I built a deterministic test bench and ran real scenarios through the
            same evidence assembler and scoring kernel that score live claims. These
            were run on July 20, 2026. They validate exact documented snapshots and
            relative behavior, but they are not
            promised scores for any individual.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observed behavior</th>
                </tr>
              </thead>
              <tbody>
                {calibrationRows.map(([scenario, score, behavior]) => (
                  <tr key={scenario} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{scenario}</td>
                    <td className="px-4 py-3 font-mono">
                      <Score value={score} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-3xl leading-7 text-muted-foreground">
            Synthetic scenarios only go so far, so I also pulled real public
            repositories into an offline corpus and hand-reviewed pairs of them to
            make sure the independence logic behaves on actual code. It holds eighteen
            immutable public repository snapshots and twenty-eight reviewed pairs,
            covering Java, Python, JavaScript, TypeScript, Rust, mixed-language
            templates, large monorepositories, exact controls, nearby revisions,
            derivatives, forks, and independent work. Git tracks repository URLs,
            commit SHAs, labels, and versioned fingerprint sketches only; no public
            source checkout is stored in this application repository.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pair</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shared</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewed</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current model</th>
                  <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {repositoryPairCalibrationRows.map(([
                  pair,
                  shared,
                  reviewed,
                  predicted,
                  score,
                ]) => (
                  <tr key={pair} className="border-b border-border transition-colors odd:bg-muted/20 hover:bg-muted/40 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{pair}</td>
                    <td className="px-4 py-3 font-mono">{shared}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reviewed}</td>
                    <td className="px-4 py-3 text-muted-foreground">{predicted}</td>
                    <td className="px-4 py-3 font-mono">
                      <Score value={score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            <Strong>Twenty-seven of twenty-eight</Strong> reviewed pairs match the
            current scoring behavior, with <Strong>zero false duplicate
            classifications</Strong>. Exact copies, nearby
            revisions, unrelated controls, templates, and large monorepositories all
            separate safely, and the maintained lineage fork receives 0.85 independence
            weight instead of being collapsed. The one remaining case is a heavily
            restructured derivative below the 60% content threshold, so it gets full
            credit rather than an unfair reduction. That is enough for me to freeze the
            current similarity thresholds for the MVP.
          </p>
        </section>

        <section id="where-it-stands" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Where it stands now</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Here is what I consider settled and what I am still working on.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Settled</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>Defined the number as verification progress.</li>
                <li>Set every evidence-free claim to a verification score of 0.</li>
                <li>Kept recognition as an evidence-routing step instead of awarding points.</li>
                <li>Removed manual, resume, and imported source from scoring.</li>
                <li>Kept parser confidence as diagnostics with no score effect.</li>
                <li>Replaced the hard AI cap jump with a gradual 80–100 unlock.</li>
                <li>Separated artifact match confidence from demonstrated evidence depth.</li>
                <li>Collapsed correlated evidence before top-K selection and rank decay.</li>
                <li>Collapsed high-confidence semantic repository copies conservatively.</li>
                <li>Added gradual novelty credit for meaningful derivative repositories.</li>
                <li>Added conservative gradual credit for meaningfully diverged forks.</li>
                <li>Weighted direct commits, merge activity, and contribution days separately.</li>
                <li>Added deterministic calibration scenarios and scoring invariants.</li>
                <li>Added an offline reviewed public repository-pair evaluation corpus.</li>
                <li>Expanded calibration to eighteen snapshots and twenty-eight reviewed pairs.</li>
                <li>Validated balanced sampling across large public monorepositories.</li>
                <li>Made repository topics, names, and descriptions discovery-only.</li>
                <li>Excluded rejected claims and left unresolved claims unscored.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Still under review</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>Signal weights have not yet been calibrated against reviewed data.</li>
                <li>Post-MVP monitoring should compare score distributions with real user outcomes.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};

export default VerificationScoringPage;
