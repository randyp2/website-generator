"use client"

interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Upload your resume",
    description: "We extract every skill you've listed — no manual entry required.",
  },
  {
    number: "02",
    title: "Review extracted skills",
    description: "Confirm what we found and remove anything that doesn't represent you accurately.",
  },
  {
    number: "03",
    title: "Connect your accounts",
    description: "Link GitHub or LinkedIn to surface real, timestamped evidence behind each skill.",
  },
  {
    number: "04",
    title: "Earn your verified badge",
    description: "Displayed on your public portfolio — a clear signal of credibility to recruiters.",
  },
]

const StepRow = ({ number, title, description }: Step) => (
  <div className="flex gap-5 border-b border-border py-4 last:border-0">
    <span className="w-5 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground/50">
      {number}
    </span>
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
)

const VerificationIntro = () => (
  <div>
    <div className="mb-8 border-l-2 border-primary pl-5">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Your skills deserve proof.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Recruiters see hundreds of resumes listing the same skills. Verification
        connects your resume to real evidence — pulling activity from GitHub,
        LinkedIn, and more — so your portfolio speaks for itself, not just for
        you.
      </p>
    </div>

    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
      How it works
    </p>

    <div>
      {STEPS.map((step) => (
        <StepRow key={step.number} {...step} />
      ))}
    </div>
  </div>
)

export default VerificationIntro
