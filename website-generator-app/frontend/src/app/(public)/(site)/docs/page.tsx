import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Scoring Documentation",
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
  ["Repository topic", "0.85"],
  ["Repository name", "0.72"],
  ["Repository description", "0.58"],
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

export default function VerificationDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-14 px-6 py-12 sm:px-10 lg:px-16">
        <section>
          <h2 className="text-2xl font-semibold">What the score means</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            A score of 50 is a neutral starting point. It means an active skill claim
            has been matched to the canonical skill dictionary and is ready for
            evidence. Scores above 50 come from active evidence such as connected
            repositories or reviewed uploads.
          </p>

          <div className="mt-6 overflow-x-auto border border-border">
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

        <section>
          <h2 className="text-2xl font-semibold">Current baseline</h2>
          <pre className="mt-5 overflow-x-auto border border-border bg-muted/30 p-5 text-sm leading-7">
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
        </section>

        <section>
          <h2 className="text-2xl font-semibold">How evidence adds progress</h2>
          <pre className="mt-5 overflow-x-auto border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`connector strength = link confidence × signal weight × recency
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
            storage fingerprints and GitHub forks with resolved lineage cannot create
            multiple scoring positions for that source. Only the strongest signal in
            the group is retained for a claim.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              Uploaded artifacts use the storage-reported SHA-256 checksum when
              available, then the verified ETag, then the upload ID as a safe fallback.
            </li>
            <li>
              GitHub repositories use the root repository numeric ID for resolved
              forks, then the repository numeric ID, then the stable external ID.
            </li>
            <li>
              Historical evidence keeps its provider and external ID, because old
              uploads cannot be fingerprinted retroactively without reading them again.
            </li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold">Gradual reviewed-evidence cap</h3>
          <pre className="mt-4 overflow-x-auto border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`review progress = clamp((evidence depth - 0.85) / 0.10, 0, 1)
claim cap       = 80 + round(20 × review progress)`}</code>
          </pre>
          <div className="mt-4 overflow-x-auto border border-border">
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
            <div className="border border-border p-5">
              <h3 className="font-semibold">Match confidence</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Measures whether the uploaded artifact actually relates to the claim.
                It controls whether an evidence link is created.
              </p>
            </div>
            <div className="border border-border p-5">
              <h3 className="font-semibold">Evidence depth</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Measures substantive demonstrated usage. It controls score strength,
                reviewed status, and gradual cap progression.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto border border-border">
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
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Profile rollup</h2>
          <pre className="mt-5 overflow-x-auto border border-border bg-muted/30 p-5 text-sm leading-7">
            <code>{`mean lift = total claim evidence lift / evidenced claims
coverage  = evidenced recognized claims / recognized claims
overall   = baseline + mean lift × sqrt(coverage)`}</code>
          </pre>
          <p className="mt-4 leading-7 text-muted-foreground">
            This lets one real piece of evidence create visible progress while still
            rewarding users who support more of their recognized claims.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Reform status</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border border-border p-5">
              <h3 className="font-semibold">Completed</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>Defined the number as verification progress.</li>
                <li>Set every recognized active claim to a neutral baseline of 50.</li>
                <li>Removed manual, resume, and imported source from baseline scoring.</li>
                <li>Kept parser confidence as diagnostics with no score effect.</li>
                <li>Replaced the hard AI cap jump with a gradual 80–100 unlock.</li>
                <li>Separated artifact match confidence from demonstrated evidence depth.</li>
                <li>Collapsed correlated evidence before top-K selection and rank decay.</li>
                <li>Excluded rejected claims and left unresolved claims unscored.</li>
              </ul>
            </div>
            <div className="border border-border p-5">
              <h3 className="font-semibold">Still under review</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>GitHub authorship and semantic near-duplicate detection need refinement.</li>
                <li>Signal weights have not yet been calibrated against reviewed data.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
