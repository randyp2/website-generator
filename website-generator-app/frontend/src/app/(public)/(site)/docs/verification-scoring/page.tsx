import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification scoring",
  description:
    "How PortRN calculates verification progress and how the scoring model is being refined.",
};

const scoreBands = [
  ["0", "No active, recognized skill claims"],
  ["1–49", "Incomplete or unresolved verification profile"],
  ["50–59", "Recognized and primarily self-declared"],
  ["60–74", "Externally corroborated"],
  ["75–84", "Strong evidence across the profile"],
  ["85–100", "Substantially reviewed evidence"],
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
  ["Three recognized claims, no evidence", "50", "Neutral baseline"],
  ["Untouched fork with dependency match", "53", "Small corroboration lift"],
  ["Owned repository with merge-only activity", "57", "Partial contribution credit"],
  ["Repository with one direct commit", "58", "Authorship improves the signal"],
  ["Several direct commits on one day", "59", "Concentrated direct contribution"],
  ["Several direct commits across multiple days", "60", "Sustained direct contribution"],
  ["Active repository with five direct commits", "61", "Strong single repository"],
  ["Authorship API unavailable", "61", "No outage penalty"],
  ["Two-year-old active repository", "55", "Gradual recency decay"],
  ["Three active repositories", "71", "Repeated independent usage"],
  ["Same project copied into two repositories", "61", "Copy adds no score"],
  ["Primary plus a small derivative", "64", "Quantity adds gradual credit"],
  ["Primary plus a meaningful derivative", "64", "Novel work adds partial credit"],
  ["Primary plus a substantial derivative", "66", "Mostly distinct work approaches full credit"],
  ["Primary plus a diverged lineage fork", "67", "Fork adds 0.85 independence weight"],
  ["Two independent active repositories", "67", "Independent work adds support"],
  ["One reviewed artifact at 0.95 depth", "69", "Strong reviewed evidence"],
  ["Five repository descriptions", "50", "Descriptions add no verification lift"],
  ["Five repository name matches", "50", "Names add no verification lift"],
  ["Five repository topic matches", "50", "Topics add no verification lift"],
  ["Same reviewed upload submitted twice", "69", "Duplicate adds no score"],
  ["Five reviewed artifacts at 0.95 depth", "91", "Expert-range evidence"],
  ["Four claims, only one evidenced", "56", "Coverage dampens profile lift"],
];

const repositoryPairCalibrationRows = [
  ["Exact snapshot control", "1.000", "Duplicate", "Duplicate", "61"],
  ["Same repository across revisions", "0.938", "Duplicate", "Duplicate by identity", "61"],
  ["Documented JavaFX derivative", "0.367", "Derivative", "Independent", "67"],
  ["Maintained TON fork", "0.273", "Derivative", "Derivative at 0.85 credit", "67"],
  ["Turborepo across revisions", "0.836", "Duplicate", "Duplicate by identity", "61"],
  ["Independent Python frameworks", "0.000", "Independent", "Independent", "67"],
  ["Independent Java projects", "0.000", "Independent", "Independent", "67"],
  ["Independent JS tooling", "0.016", "Independent", "Independent", "67"],
  ["Independent app templates", "0.023", "Independent", "Independent", "67"],
  ["Cross-language projects", "0.000", "Independent", "Independent", "67"],
];

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
          The score measures progress toward supporting recognized skill claims.
          It is not a skill grade, expertise rating, or probability that a claim is true.
        </p>
      </header>

      <div className="mt-12 space-y-14">
        <section id="what-the-score-means" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">What the score means</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            A score of 50 is a neutral starting point. It means an active skill claim
            has been matched to the canonical skill dictionary and is ready for
            evidence. Scores above 50 come from active evidence such as connected
            repositories or reviewed uploads.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Score</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {scoreBands.map(([score, meaning]) => (
                  <tr key={score} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono">{score}</td>
                    <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="current-baseline" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Current baseline</h2>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`recognized active claim = 50
unresolved claim        = no score baseline
rejected claim          = excluded

manual source           = 50
resume source           = 50
imported source         = 50`}</code>
          </pre>
          <p className="mt-4 leading-7 text-muted-foreground">
            Claim source remains visible as provenance, but it no longer changes the
            baseline. A resume and an imported profile are still self-asserted sources,
            so neither receives verification credit before evidence exists.
          </p>
          <p className="mt-4 leading-7 text-muted-foreground">
            Before scoring, extracted wording must match a canonical skill name or
            alias. Unresolved claims remain visible but do not receive a baseline or
            evidence lift until the dictionary recognizes them. The versioned skill
            catalog is maintained in JSON and applied through immutable database
            migrations so new aliases can also repair existing unresolved claims. The
            current catalog recognizes common AWS service abbreviations, Supabase,
            Flyway, RAG pipelines, and LLM API integration terms.
          </p>
        </section>

        <section id="how-evidence-adds-progress" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">How evidence adds progress</h2>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`connector strength = link confidence × signal weight × authorship × independence × recency
reviewed strength  = evidence depth × signal weight × recency
signal strength    = connector strength or reviewed strength

independent signals = strongest signal per evidence group
effective evidence  = Σ(independent signal strength × 0.75^rank)
support            = 1 - exp(-0.70 × effective evidence)
boost progress     = support^1.35
claim score        = 50 + (claim cap - 50) × boost progress`}</code>
          </pre>
          <p className="mt-4 leading-7 text-muted-foreground">
            Signals are sorted strongest first. Correlated signals are collapsed to
            the strongest member of each evidence group before the ten-signal limit
            and rank decay are applied. Connector-only claims are capped at 80.
            Qualifying AI-reviewed uploads currently unlock the range above 80.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Evidence independence</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            An evidence group represents one underlying source. Uploads with matching
            storage fingerprints and repositories with highly overlapping sampled
            source cannot create multiple scoring positions for that source. Resolved
            GitHub lineage remains a correlation signal, but a meaningfully diverged
            fork can receive gradual independent credit. Only the strongest signal in
            a collapsed group is retained for a claim.
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

          <h3 className="mt-8 text-lg font-semibold">Derivative repository credit</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            Similarity is not treated as a code-quality judgment. It only estimates
            how independently another repository supports the same skill. Meaningful
            quantity still counts, so derivatives remain separate evidence positions
            and receive gradual credit for their estimated novel source content.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`shared content ≤ 60%  → independence weight 1.00
shared content 65%   → independence weight 0.875
shared content 70%   → independence weight 0.75
shared content 80%   → independence weight 0.50
shared content 85%   → independence weight 0.375
shared content ≥ 90% → same evidence group, no duplicate position

between 60% and 90%:
weight = 0.25 + 0.75 × ((0.90 - shared content) / 0.30)

resolved lineage fork:
weight = min(content-based weight, 0.85)`}</code>
          </pre>
          <p className="mt-4 leading-7 text-muted-foreground">
            Within a related family, the repository with the largest sampled token
            count is selected as the primary, followed by authorship and recency as
            tie-breakers. Other repositories are compared directly with that primary,
            preventing similarity chains from reducing unrelated work. Formatting,
            renames, generated output, dependency folders, documentation, and lock-file
            changes do not manufacture novelty credit. Resolved lineage is treated as
            a conservative prior rather than permanent duplication. Comparable forks
            below 90% similarity remain separate, but their independence weight cannot
            exceed 0.85. Without a comparable fingerprint, the root lineage group is
            retained as the safe fallback.
          </p>

          <h3 className="mt-8 text-lg font-semibold">GitHub authorship</h3>
          <p className="mt-4 leading-7 text-muted-foreground">
            Repository evidence is multiplied by an authorship weight based on commits
            GitHub attributes to the connected account. The sync reads at most five
            matching commits for each of the thirty most recently updated repositories.
            It separates direct commits from merge commits and counts distinct direct
            contribution days. Uploads and non-repository evidence use a weight of 1.00.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Authorship result</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {authorshipWeights.map(([result, weight]) => (
                  <tr key={result} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{result}</td>
                    <td className="px-4 py-3 font-mono">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            API failures and scan limits never reduce a score. GitHub may report no
            matching commits when work uses an unlinked email or alternate identity,
            so zero-commit results use gradual floors instead of excluding a repository.
            AI-assisted commits are allowed. The model does not attempt to identify the
            tools used to create code or infer authorship from commit messages.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Gradual reviewed-evidence cap</h3>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`review progress = clamp((evidence depth - 0.85) / 0.10, 0, 1)
claim cap       = 80 + round(20 × review progress)`}</code>
          </pre>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Evidence depth</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Available cap</th>
                </tr>
              </thead>
              <tbody>
                {evidenceDepthCaps.map(([depth, cap]) => (
                  <tr key={depth} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono">{depth}</td>
                    <td className="px-4 py-3 font-mono">{cap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            The cap only defines available headroom. Evidence strength and breadth
            still determine how much of that headroom the claim earns.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Match confidence</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Measures whether the uploaded artifact actually relates to the claim.
                It controls whether an evidence link is created.
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Evidence depth</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Measures substantive demonstrated usage. It controls score strength,
                reviewed status, and gradual cap progression.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Signal</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Current weight</th>
                </tr>
              </thead>
              <tbody>
                {signalWeights.map(([signal, weight]) => (
                  <tr key={signal} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{signal}</td>
                    <td className="px-4 py-3 font-mono">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            Repository topics, names, and descriptions can help associate a repository
            with a skill claim, but they are user-controlled discovery metadata.
            Metadata-only links remain visible as provenance and do not affect score,
            evidence counts, or claim status.
          </p>
        </section>

        <section id="profile-rollup" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Profile rollup</h2>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`mean lift = total claim evidence lift / evidenced claims
coverage  = evidenced recognized claims / recognized claims
overall   = baseline + mean lift × sqrt(coverage)`}</code>
          </pre>
          <p className="mt-4 leading-7 text-muted-foreground">
            This lets one real piece of evidence create visible progress while still
            rewarding users who support more of their recognized claims.
          </p>
        </section>

        <section id="calibration-snapshot" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Calibration snapshot</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            These deterministic scenarios were run through the real evidence assembler
            and scoring kernel on July 12, 2026. They validate relative behavior and
            are not promised scores for individual users.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Scenario</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Score</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Observed behavior</th>
                </tr>
              </thead>
              <tbody>
                {calibrationRows.map(([scenario, score, behavior]) => (
                  <tr key={scenario} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{scenario}</td>
                    <td className="px-4 py-3 font-mono">{score}</td>
                    <td className="px-4 py-3 text-muted-foreground">{behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="repository-pair-evaluation" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Real repository-pair evaluation</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            The offline evaluation corpus contains eighteen immutable public repository
            snapshots and twenty-eight manually reviewed pairs. It covers Java, Python,
            JavaScript, TypeScript, Rust, mixed-language templates, large monorepositories,
            exact controls, nearby revisions, derivatives, forks, and independent work.
            Git tracks repository URLs, commit SHAs, labels, and versioned fingerprint
            sketches only. No public source checkout is stored in this application repository.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-medium">Pair</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Shared</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Reviewed</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Current model</th>
                  <th className="border-b border-border px-4 py-3 font-medium">Score</th>
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
                  <tr key={pair} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{pair}</td>
                    <td className="px-4 py-3 font-mono">{shared}</td>
                    <td className="px-4 py-3 text-muted-foreground">{reviewed}</td>
                    <td className="px-4 py-3 text-muted-foreground">{predicted}</td>
                    <td className="px-4 py-3 font-mono">{score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            Twenty-seven of twenty-eight reviewed pairs match the current scoring
            behavior, with zero false duplicate classifications. Exact copies, nearby
            revisions, unrelated controls, templates, and large monorepositories
            separate safely. The maintained lineage fork receives 0.85 independence
            weight instead of being collapsed. The remaining review case is a heavily
            restructured derivative below the 60% content threshold, so it receives full
            credit rather than risking an unfair reduction. These results support freezing
            the current similarity thresholds for the MVP.
          </p>
        </section>

        <section id="reform-status" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold">Reform status</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">Completed</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>Defined the number as verification progress.</li>
                <li>Set every recognized active claim to a neutral baseline of 50.</li>
                <li>Removed manual, resume, and imported source from baseline scoring.</li>
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
