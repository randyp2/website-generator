import type { Metadata } from "next";

// Operated as a sole proprietorship (no separate legal entity), so the brand
// name is the controller. Update EFFECTIVE_DATE if you prefer a launch date.
const COMPANY_NAME = "PortRN";
const CONTACT_EMAIL = "portrnco@gmail.com";
const EFFECTIVE_DATE = "July 12, 2026";

export const metadata: Metadata = {
    title: `Privacy Policy | ${COMPANY_NAME}`,
    description: `How ${COMPANY_NAME} collects, uses, shares, and protects your personal data.`,
};

interface ExternalLink {
    label: string;
    href: string;
}

interface Section {
    id: string;
    heading: string;
    /** Rendered as paragraphs. */
    body?: string[];
    /** Rendered as a bulleted list. */
    points?: string[];
    /** Rendered as a trailing paragraph of external links. */
    links?: ExternalLink[];
}

const sections: Section[] = [
    {
        id: "intro",
        heading: "1. Who we are",
        body: [
            `${COMPANY_NAME} ("we", "us") operates an AI portfolio generator that turns your resume and related materials into a publishable personal website. This policy explains what personal data we collect, how we use it, who we share it with, and the rights you have over it.`,
            `We are the controller of the personal data described here. If you have questions or want to exercise your rights, contact us at ${CONTACT_EMAIL}.`,
        ],
    },
    {
        id: "collect",
        heading: "2. Information we collect",
        body: [
            "We collect the following categories of personal data, most of it provided directly by you when you use the service:",
        ],
        points: [
            "Account and authentication data: your email address and the authentication identifiers managed by our authentication provider.",
            "Profile data: information you add to your public profile, such as name, headline, bio, avatar, and links.",
            "Resume and uploads: resume or CV files you upload, the text and structured data we extract from them, and any images, video, or other media you add to a portfolio.",
            "Connected accounts: when you connect a provider such as GitHub for skill verification, we receive your provider profile and repository signals used to assess the claims you make.",
            "Portfolio content: the portfolios, sections, edits, and chat history you create while using the generator.",
            "Engagement data: likes, comments, follows, shares, and view counts related to public portfolios and profiles.",
            "Billing data: subscription, invoice, and credit records. Payment card details are handled by our payment processor (Stripe) and are not stored on our servers.",
            "Technical data: IP address and request metadata, used for security, abuse prevention, and rate limiting.",
        ],
    },
    {
        id: "use",
        heading: "3. How we use your information",
        points: [
            "To provide the core service: parsing your resume, generating and refining portfolio content, and publishing your site.",
            "To run skill verification: assessing evidence you provide (uploads and connected accounts) against the claims on your profile.",
            "To process payments, manage subscriptions and credits, and send billing-related messages.",
            "To send transactional email, such as verification, notifications, and account messages.",
            "To secure the service, prevent abuse, and enforce rate limits.",
            "To comply with legal obligations.",
        ],
    },
    {
        id: "ai",
        heading: "4. AI processing of your content",
        body: [
            "To generate and refine your portfolio and to support verification, we send relevant content, including text derived from your resume, to third-party AI providers (OpenAI, Anthropic, and Google) that process it on our behalf and return generated output.",
            "Under our agreements with these providers, content submitted through their APIs is not used to train their models. We share only what is needed to produce your result. Each provider processes data under its own privacy policy:",
        ],
        links: [
            {
                label: "OpenAI Privacy Policy",
                href: "https://openai.com/policies/privacy-policy/",
            },
            {
                label: "Anthropic Privacy Policy",
                href: "https://www.anthropic.com/legal/privacy",
            },
            {
                label: "Google Privacy Policy",
                href: "https://policies.google.com/privacy",
            },
        ],
    },
    {
        id: "share",
        heading: "5. How we share your information",
        body: [
            "We do not sell your personal data. We share it only with service providers (subprocessors) that help us operate the service, each acting under contract and only as needed:",
        ],
        points: [
            "Supabase (authentication and database hosting)",
            "Vercel (application hosting)",
            "Cloudflare R2 (file and media storage)",
            "Upstash (Redis, caching and rate limiting)",
            "Our managed message-queue provider (asynchronous job processing)",
            "Resend (transactional email delivery)",
            "Stripe (payment processing)",
            "OpenAI, Anthropic, and Google (AI generation and verification)",
            "GitHub (only when you choose to connect it for verification)",
        ],
    },
    {
        id: "public",
        heading: "6. Information you make public",
        body: [
            "Portfolios and profiles you publish are, by design, publicly accessible. Anything you choose to include in a published portfolio or public profile can be viewed by anyone with the link and may be indexed by search engines. Do not include information in a published site that you want to keep private.",
        ],
    },
    {
        id: "cookies",
        heading: "7. Cookies",
        body: [
            "We use only essential cookies required to keep you signed in and to operate the service. We do not use advertising or third-party analytics tracking cookies.",
        ],
    },
    {
        id: "retention",
        heading: "8. Data retention",
        body: [
            "We keep your personal data for as long as your account is active or as needed to provide the service. When you delete a portfolio, resume, upload, or connected account, we remove the associated data. When you ask us to delete your account, we delete your personal data except where we must retain limited records (for example, billing records) to meet legal obligations.",
        ],
    },
    {
        id: "rights",
        heading: "9. Your rights",
        body: [
            "Depending on where you live, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can delete individual portfolios, resumes, uploads, and connected accounts directly in the app.",
            // TODO(launch): this statement describes self-serve account
            // deletion as live. The delete-account action is not wired up yet
            // (no full account-deletion endpoint exists). Wire it before launch
            // so this claim is truthful, per the enforceable-promise risk.
            "You can permanently delete your account and all associated data at any time from your account settings. When you do, we delete your personal data except for limited records we are legally required to retain, such as billing records. You can also contact us at " +
                CONTACT_EMAIL +
                " to make an access or deletion request; we will verify your identity and respond within 30 days. You will not be discriminated against for exercising these rights.",
        ],
    },
    {
        id: "security",
        heading: "10. Security",
        body: [
            "We use technical and organizational measures to protect your data, including encryption in transit and access controls. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        ],
    },
    {
        id: "transfers",
        heading: "11. International data transfers",
        body: [
            "Our providers may process your data in countries other than the one you live in, including the United States. Where required, we rely on appropriate safeguards for these transfers.",
        ],
    },
    {
        id: "children",
        heading: "12. Children",
        body: [
            "The service is not directed to children under 16, and we do not knowingly collect their personal data. If you believe a child has provided us data, contact us and we will delete it.",
        ],
    },
    {
        id: "changes",
        heading: "13. Changes to this policy",
        body: [
            "We may update this policy from time to time. We will post the updated version here and change the effective date above. Material changes will be communicated where appropriate.",
        ],
    },
    {
        id: "contact",
        heading: "14. Contact us",
        body: [
            `For any privacy question or request, contact us at ${CONTACT_EMAIL}.`,
        ],
    },
];

const PrivacyPolicyPage = () => {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16">
            <header className="mb-12">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Privacy Policy
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Effective {EFFECTIVE_DATE}
                </p>
            </header>

            <div className="space-y-10">
                {sections.map((section) => (
                    <section key={section.id} id={section.id}>
                        <h2 className="text-xl font-semibold tracking-tight">
                            {section.heading}
                        </h2>
                        {section.body?.map((paragraph, i) => (
                            <p
                                key={i}
                                className="mt-3 text-sm leading-relaxed text-muted-foreground"
                            >
                                {paragraph}
                            </p>
                        ))}
                        {section.points && (
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                                {section.points.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        )}
                        {section.links && (
                            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                {section.links.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline underline-offset-4 hover:no-underline"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </p>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
