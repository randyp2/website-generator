import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  CreditCard,
  Database,
  GitBranch,
  Layers3,
  LockKeyhole,
  RefreshCw,
  ServerCog,
  ShieldCheck,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Engineering notes",
  description:
    "How PortRN moved portfolio generation out of a long-running HTTP request and into an asynchronous job pipeline.",
}

const originalProblems = [
  {
    title: "A blocked request",
    description:
      "The browser had to keep one HTTP request alive while every section was generated.",
    icon: Clock3,
  },
  {
    title: "Unclear recovery",
    description:
      "A timeout or refresh could lose the response without explaining whether the work had failed.",
    icon: RefreshCw,
  },
  {
    title: "One slow pipeline",
    description:
      "Planning, section generation, validation, and persistence all happened before the request could finish.",
    icon: GitBranch,
  },
]

const generationSteps = [
  {
    number: "01",
    title: "Accept the request",
    description:
      "The Next.js route authenticates the user, enforces limits, gathers portfolio assets, and calls the Spring API.",
  },
  {
    number: "02",
    title: "Create a job",
    description:
      "The backend stores a short-lived job record in Redis, publishes a generation message to RabbitMQ, and returns a job ID immediately.",
  },
  {
    number: "03",
    title: "Plan the portfolio",
    description:
      "An orchestration worker refines the direction, creates the global theme and section blueprint, then fans each section out as its own message.",
  },
  {
    number: "04",
    title: "Generate in parallel",
    description:
      "Section consumers run concurrently. Each one calls the model, parses the result, validates the JSX, and repairs or falls back when needed.",
  },
  {
    number: "05",
    title: "Report progress",
    description:
      "Completed sections are appended to Redis. The frontend polls with an offset and renders new sections without downloading old ones again.",
  },
  {
    number: "06",
    title: "Commit the result",
    description:
      "The final worker gathers every section, writes a version snapshot and live sections to PostgreSQL, and marks the job complete.",
  },
]

const codeAreas = [
  {
    responsibility: "Browser polling and incremental rendering",
    path: "frontend/src/app/(dashboard)/dashboard/create/refine/hooks/useInitialPortfolioGeneration.ts",
  },
  {
    responsibility: "Job state, completed sections, and queue fan-out",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/portfolio/service/job/GenerateJobService.java",
  },
  {
    responsibility: "Generation, section, and dead-letter consumers",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/portfolio/service/job/GenerationWorker.java",
  },
  {
    responsibility: "Exchanges, routing keys, queues, and dead-letter bindings",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/shared/config/RabbitMQConfig.java",
  },
  {
    responsibility: "Planning, generation, validation, fallback, and persistence",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/portfolio/service/PortfolioAiServiceImpl.java",
  },
  {
    responsibility: "Stripe signature checks, event dispatch, and webhook lifecycle",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/billing/service/impl/StripeWebhookServiceImpl.java",
  },
  {
    responsibility: "Atomic credit reservation and idempotent compensation",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/billing/service/impl/CreditGuardServiceImpl.java",
  },
  {
    responsibility: "Durable verification jobs, outbox events, retries, and recovery",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/verification/service/job/AssetVerificationJobService.java",
  },
  {
    responsibility: "Public URL validation for external fetch and screenshot flows",
    path: "webgen-backend/src/main/java/com/webgen/webgen_backend/shared/util/ExternalUrlSafetyValidator.java",
  },
]

const EngineeringPage = () => (
  <article>
    <header className="border-b border-border pb-10">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Open source engineering notes
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
        Engineering PortRN
      </h1>
      <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
        I want the source to explain more than what the product does. This is where I
        document the interesting problems behind it, the early decisions that did not
        scale, and the architecture I ended up choosing. I am starting with the system
        that generates a portfolio because it forced the biggest change in how I
        thought about the backend, then covering a few other places where reliability
        mattered more than the happy path.
      </p>
    </header>

    <div className="mt-12 space-y-14">
      <section
        id="why-write-about-the-code"
        className="scroll-mt-28 rounded-2xl border border-primary/40 bg-primary/[0.04] p-6 shadow-[0_0_40px_-12px_color-mix(in_oklab,var(--primary)_75%,transparent)] sm:p-8"
      >
        <h2 className="text-2xl font-semibold">Why write about the code</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Open source is much more useful when the decisions are visible too. A queue,
          a Redis key, or a polling hook can look like unnecessary complexity in
          isolation. The original failure mode explains why each one exists. These
          notes are my attempt to keep that context next to the product instead of
          leaving it buried in old commits and comments I will definitely forget I
          wrote.
        </p>
      </section>

      <section id="the-first-version" className="scroll-mt-28">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          The original problem
        </p>
        <h2 className="mt-4 text-2xl font-semibold">
          The first version was one very long API call
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Portfolio generation started as the obvious implementation: accept a
          request, call the model, build every section, and return the finished
          portfolio. A full run took roughly <strong className="font-semibold text-foreground">6 to 10 minutes</strong>.
          At that point it was no longer a normal request-response flow. It was a
          background job wearing an HTTP request as a disguise.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          The browser-facing application was hosted on Vercel and the backend ran on
          AWS. Keeping a request open across that path for several minutes made
          timeouts, disconnects, and uncertain retries part of the user experience.
          Even if the model finished successfully, any layer in front of it could stop
          waiting first. That was enough for me to stop treating generation as one
          synchronous operation.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {originalProblems.map((problem) => {
            const Icon = problem.icon

            return (
              <div key={problem.title} className="rounded-xl border border-border p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{problem.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="why-not-sse" className="scroll-mt-28">
        <h2 className="text-2xl font-semibold">Why I did not solve it with SSE</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          I considered Server-Sent Events because they are a good fit for lightweight,
          one-way progress updates. I could technically stream section payloads over
          SSE too, but streaming was not the real problem. I needed the work to survive
          a lost browser connection, support retries, fan out into parallel tasks, and
          end with one consistent result in the database.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          SSE would have improved delivery while the connection was alive. It would
          not have created durable job state or a replay strategy by itself. I chose a
          job ID plus persisted progress instead. The client asks for completed
          sections at a short interval, renders only what is new, and can reconnect to
          the same job after a refresh. Polling is not glamorous, but boring is a
          feature when it makes recovery predictable.
        </p>
      </section>

      <section id="portfolio-generation" className="scroll-mt-28">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Dedicated system walkthrough
        </p>
        <h2 className="mt-4 text-2xl font-semibold">
          How portfolio generation works now
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          The request now creates work instead of waiting for all of it. Redis holds
          temporary job state and completed section payloads. RabbitMQ separates the
          orchestration step from the section work. PostgreSQL remains the source of
          truth for the finished portfolio and its version history.
        </p>

        <ol className="mt-7 grid gap-4 sm:grid-cols-2">
          {generationSteps.map((step) => (
            <li
              key={step.number}
              className="rounded-xl border border-border/70 bg-card/[0.28] p-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">
                  {step.number}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border px-5 py-7">
            <Layers3 className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">Incremental results</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Users see sections as they finish instead of staring at one loading
              state for the entire run.
            </p>
          </div>
          <div className="rounded-xl border border-border px-5 py-7">
            <ServerCog className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">Parallel consumers</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Section generation currently runs with ten consumer slots, so one slow
              section does not serialize the rest.
            </p>
          </div>
          <div className="rounded-xl border border-border px-5 py-7">
            <CheckCircle2 className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">Validated output</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Generated JSX is parsed and validated before it is accepted, with repair
              attempts and a safe fallback path.
            </p>
          </div>
        </div>
      </section>

      <section id="target-architecture" className="scroll-mt-28">
        <h2 className="text-2xl font-semibold">The target architecture</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          This diagram shows the logical boundaries and the architecture I would use
          if each workload needed to scale independently. The API gateway, generation
          workers, section workers, and dead-letter worker are target-state deployment
          boundaries. The queues and data flow are real. The separate servers are the
          idealized part.
        </p>

        <figure className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          <Image
            src="/images/docs/portfolio-generation-architecture.svg"
            alt="Portfolio generation target architecture showing the request path, Redis job state, RabbitMQ exchanges and queues, generation workers, section workers, OpenAI, and persistent portfolio storage."
            width={2048}
            height={1152}
            unoptimized
            className="h-auto w-full"
          />
        </figure>

        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            <strong className="font-semibold text-foreground">Diagram note:</strong>{" "}
            there is no standalone API gateway in the current deployment. Today the
            Next.js API route and Spring controllers form that boundary. I keep the
            gateway in the target diagram because it is where routing, TLS
            termination, load balancing, and authentication concerns would converge
            in a larger deployment.
          </p>
        </div>
      </section>

      <section id="what-runs-today" className="scroll-mt-28">
        <h2 className="text-2xl font-semibold">What actually runs today</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Production is a modular monolith, and that is intentional. The orchestration
          worker, section consumers, persistence logic, and API live in one Spring
          application. RabbitMQ, Redis, and PostgreSQL provide the boundaries around
          it, while the internal services keep responsibilities separate in code.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          I could deploy every box in the diagram as its own service and scale each one
          independently. I also do not have the budget to host a small civilization of
          servers, lol. More importantly, that complexity would not buy enough right
          now. One deployable is easier to operate, debug, and change while the product
          is still moving quickly.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          The queue message contracts give me an exit path. If section generation
          becomes the bottleneck, I can move that consumer into its own deployment
          without rewriting the browser flow or the job model. Until that pressure is
          real, the monolith is the better architecture, not a temporary embarrassment.
        </p>
      </section>

      <section id="billing-idempotency" className="scroll-mt-28">
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">
            Keeping money correct when Stripe retries
          </h2>
        </div>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Billing is where a harmless duplicate request can become a very real bug.
          Stripe may deliver the same webhook again, and two copies can arrive close
          enough to race. I did not want correctness to depend on checking an event ID
          in memory and hoping another instance did not make the same decision.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">1. Verify before trusting</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The raw body and Stripe signature are verified before event metadata is
              accepted or any billing handler runs.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">2. Claim the event in PostgreSQL</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each Stripe event ID has a unique row. Row locks and the unique
              constraint resolve concurrent claims, while processing, processed, and
              failed states preserve an audit trail.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">3. Make the side effect idempotent too</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Credit-pack fulfillment checks both the event ID and checkout session.
              A database index prevents the same checkout from granting credits twice,
              even if it appears in distinct events.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">4. Record movement instead of mutating a total</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Credits use an append-only delta ledger. Generation reserves usage
              before work is queued, and failures append a compensating refund tied to
              the original operation ID.
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          Refunds are idempotent as well. The service locks the profile, checks for an
          existing compensation, and relies on a unique operation-and-reason index as
          the final guard. This gives me layered protection: provider event identity,
          business operation identity, transaction boundaries, and database
          constraints. Money code deserves more than one seat belt.
        </p>
      </section>

      <section id="verification-jobs" className="scroll-mt-28">
        <div className="flex items-center gap-3">
          <Database className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">
            Making verification jobs recoverable
          </h2>
        </div>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Uploaded evidence verification has a stricter durability model than the
          portfolio generation cache. The job and its outbox event are written to
          PostgreSQL in the same transaction. A scheduled publisher sends committed
          outbox records to RabbitMQ with bounded exponential backoff, so a broker
          outage cannot leave me with a database row that was never queued.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          Workers ignore a duplicate delivery after completion, track attempt counts,
          and create another outbox event when work should retry. A recovery task scans
          for jobs that have been queued or processing for too long. It either schedules
          them again or marks them failed after the attempt limit and returns the credit
          reservation. Redis is only a fast polling cache here. PostgreSQL owns the
          durable state.
        </p>

        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/[0.04] p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            <strong className="font-semibold text-foreground">Why this matters:</strong>{" "}
            persisting a job and publishing a message are two different systems. The
            transactional outbox closes the gap between them without pretending I have
            a distributed transaction. The separate{" "}
            <Link
              href="/docs/verification-scoring"
              className="font-medium text-primary hover:underline"
            >
              verification scoring notes
            </Link>{" "}
            explain what happens after the evidence is processed.
          </p>
        </div>
      </section>

      <section id="security-boundaries" className="scroll-mt-28">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">
            Treating URLs and uploads as trust boundaries
          </h2>
        </div>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          PortRN accepts files and can visit external portfolio URLs, which means user
          input can cross storage and network boundaries. I centralized those checks
          instead of asking every controller and worker to remember the same rules.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-5">
            <LockKeyhole className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">External URL safety</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The shared validator accepts public HTTP or HTTPS destinations, rejects
              credentials and local or reserved address ranges, and checks every
              resolved address. Site verification validates each redirect and limits
              redirects, response time, content type, and HTML size.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">Scoped direct uploads</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Clients upload directly with signed storage instructions, but the server
              chooses portfolio-scoped paths and enforces size, extension, MIME,
              bucket, and object metadata rules before saving references.
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          The screenshot worker applies the URL policy again to browser subrequests,
          so an external page cannot freely turn the headless browser into a path to
          internal services. It also checks version identity before starting an
          expensive capture and skips previews that already exist, so a stale queued
          job is dropped instead of doing wasted work. A version that changes during
          the capture itself can still land a stale preview, which is a narrow race I
          have chosen to live with for now.
        </p>
      </section>

      <section id="code-map" className="scroll-mt-28">
        <div className="flex items-center gap-3">
          <Code2 className="size-5 text-primary" />
          <h2 className="text-2xl font-semibold">Where this lives in the code</h2>
        </div>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          These are the best starting points if you want to follow the full path from
          the browser to the final database write.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          {codeAreas.map((area) => (
            <div
              key={area.path}
              className="border-b border-border px-5 py-4 last:border-0"
            >
              <p className="text-sm font-medium text-foreground">
                {area.responsibility}
              </p>
              <code className="mt-2 block break-all text-xs leading-5 text-muted-foreground">
                {area.path}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section id="tradeoffs" className="scroll-mt-28">
        <h2 className="text-2xl font-semibold">Tradeoffs I still accept</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          This design removed the long HTTP dependency, but it did not remove every
          compromise. Job state in Redis is temporary, progress uses polling instead
          of push delivery, and the API and workers still scale together in the
          monolith. A final worker also acts as the barrier that gathers sections and
          commits the completed version.
        </p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          I am comfortable with those choices because they are visible and reversible.
          The system now has the property I needed most: a dropped HTTP connection no
          longer decides whether expensive generation work can finish. The goal was
          never to collect infrastructure. It was to move failure away from the user&apos;s
          request and make progress recoverable.
        </p>

        <Link
          href="/docs/how-it-works"
          className="group mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          See the product workflow
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  </article>
)

export default EngineeringPage
