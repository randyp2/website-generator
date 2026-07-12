import type { Metadata } from "next";

// Sole proprietorship, so the brand name is the operator. Update
// EFFECTIVE_DATE if you prefer a launch date.
const COMPANY_NAME = "PortRN";
const CONTACT_EMAIL = "portrnco@gmail.com";
const EFFECTIVE_DATE = "July 12, 2026";
// TODO(legal): set the state/country whose law governs these terms. This is
// the one value here that cannot be derived from the codebase.
const GOVERNING_LAW = "the State of [YOUR STATE], United States";

export const metadata: Metadata = {
    title: `Terms of Service | ${COMPANY_NAME}`,
    description: `The terms that govern your use of ${COMPANY_NAME}.`,
};

interface Section {
    id: string;
    heading: string;
    /** Rendered as paragraphs. */
    body?: string[];
    /** Rendered as a bulleted list. */
    points?: string[];
}

const sections: Section[] = [
    {
        id: "acceptance",
        heading: "1. Acceptance of these terms",
        body: [
            `These Terms of Service ("Terms") are an agreement between you and ${COMPANY_NAME} ("we", "us"), a sole proprietorship. They govern your access to and use of our website, app, and services (the "Service"). By creating an account, checking the box that says you agree to these Terms, or using the Service, you accept these Terms. If you do not agree, please do not use the Service.`,
            "If you use the Service on behalf of an organization, you confirm that you are authorized to accept these Terms on its behalf.",
        ],
    },
    {
        id: "service",
        heading: "2. What we provide",
        body: [
            "We provide an AI portfolio generator that turns your resume and related materials into a publishable personal website, along with optional features such as skill verification. We may add, change, or remove features over time to improve the Service.",
        ],
    },
    {
        id: "account",
        heading: "3. Your account",
        points: [
            "You must be at least 16 years old to use the Service.",
            "You agree to provide accurate account information and to keep it up to date.",
            "You are responsible for keeping your login credentials secure and for all activity that happens under your account.",
            "Tell us promptly at " +
                CONTACT_EMAIL +
                " if you believe your account has been accessed without permission.",
        ],
    },
    {
        id: "acceptable-use",
        heading: "4. Acceptable use",
        body: ["When using the Service, you agree not to:"],
        points: [
            "Upload content you do not have the right to use, or that infringes anyone else's rights.",
            "Upload unlawful, harmful, deceptive, or misleading content, or impersonate another person.",
            "Misrepresent your identity, experience, or credentials, including in materials you submit for verification.",
            "Attempt to break, overload, reverse engineer, or gain unauthorized access to the Service or its infrastructure.",
            "Use the Service to build a competing product, or resell it, without our permission.",
            "Use automated means to access the Service in a way that harms it or other users.",
        ],
    },
    {
        id: "your-content",
        heading: "5. Your content",
        body: [
            "You keep ownership of the content you upload or create, including your resume, media, and the portfolios you build. You grant us a limited license to host, process, and display that content solely to operate and provide the Service to you, including sending it to the third-party providers described in our Privacy Policy so we can generate your results.",
            "You are responsible for the content you publish. Anything you make public through a published portfolio or profile can be seen by anyone with the link.",
        ],
    },
    {
        id: "ai-content",
        heading: "6. AI-generated content",
        body: [
            "The Service uses AI to generate and refine portfolio content. AI output can be inaccurate, incomplete, or not suited to your purpose. We do not warrant that generated content will be accurate, original, or error-free.",
            "You are responsible for reviewing and editing any AI-generated content before you rely on it or publish it. You are responsible for the final content you choose to publish.",
        ],
    },
    {
        id: "verification",
        heading: "7. Skill verification",
        body: [
            "Our verification feature produces an automated, heuristic signal based on the evidence you provide, such as uploads and connected accounts. It is an estimate, not a guarantee. It is not a background check, a certification, an endorsement, or a professional assessment of anyone's abilities.",
            "You should not treat a verification result as proof of a person's skills or qualifications, and you agree not to present it to others as such. We are not responsible for decisions you or anyone else makes based on a verification result.",
        ],
    },
    {
        id: "payments",
        heading: "8. Payments and subscriptions",
        body: [
            "Some features require payment. Paid plans and credits are described at the point of purchase. Payments are processed by our payment processor, Stripe, and by paying you also agree to Stripe's terms. We do not store your full payment card details.",
            "Paid subscriptions renew automatically for the same period until you cancel. You can cancel at any time from your billing settings, and the cancellation takes effect at the end of the current billing period. Prices may change, and we will give notice of changes before they apply to a renewal.",
        ],
    },
    {
        id: "refunds",
        heading: "9. Refunds",
        body: [
            "Except where required by law, payments are non-refundable, and canceling stops future charges rather than refunding the current period. If you believe you were charged in error, contact us at " +
                CONTACT_EMAIL +
                " and we will review it in good faith.",
        ],
    },
    {
        id: "third-party",
        heading: "10. Third-party services",
        body: [
            "The Service relies on third-party providers, including AI providers and, when you connect them, services such as GitHub. Your use of those services through the Service may also be subject to their own terms. We are not responsible for third-party services we do not control.",
        ],
    },
    {
        id: "ip",
        heading: "11. Our intellectual property",
        body: [
            `The Service itself, including our software, design, and branding, belongs to ${COMPANY_NAME}. These Terms do not give you any rights to our intellectual property except the limited right to use the Service as allowed here.`,
        ],
    },
    {
        id: "termination",
        heading: "12. Suspension and termination",
        body: [
            "You can stop using the Service and delete your account at any time. We may suspend or end your access if you break these Terms, if we are required to by law, or if we stop offering the Service. When your account ends, the sections of these Terms that by their nature should survive will continue to apply.",
        ],
    },
    {
        id: "disclaimer",
        heading: "13. Disclaimer of warranties",
        body: [
            'The Service is provided "as is" and "as available", without warranties of any kind, whether express or implied, including any implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.',
        ],
    },
    {
        id: "liability",
        heading: "14. Limitation of liability",
        body: [
            "To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or business, arising out of or related to your use of the Service.",
            "To the fullest extent permitted by law, our total liability for all claims relating to the Service is limited to the greater of the amount you paid us in the twelve months before the event giving rise to the claim, or one hundred US dollars (100 USD).",
        ],
    },
    {
        id: "indemnification",
        heading: "15. Indemnification",
        body: [
            "You agree to defend and indemnify us against claims, damages, and costs (including reasonable legal fees) arising from the content you publish through the Service, your misuse of the Service, or your violation of these Terms or of anyone else's rights.",
        ],
    },
    {
        id: "changes",
        heading: "16. Changes to the Service and these Terms",
        body: [
            "We may update these Terms from time to time. When we do, we will post the updated version here and change the effective date above. If the changes are material, we will take reasonable steps to let you know. Continuing to use the Service after the changes take effect means you accept the updated Terms.",
        ],
    },
    {
        id: "governing-law",
        heading: "17. Governing law",
        body: [
            `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-laws rules. You agree that any dispute will be handled in the courts located there, unless applicable law gives you the right to bring it elsewhere.`,
        ],
    },
    {
        id: "contact",
        heading: "18. Contact us",
        body: [
            `Questions about these Terms? Reach us any time at ${CONTACT_EMAIL}.`,
        ],
    },
];

const TermsOfServicePage = () => {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16">
            <header className="mb-12">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Terms of Service
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Effective {EFFECTIVE_DATE}
                </p>
            </header>

            <div className="mb-12 rounded-xl border border-border bg-muted/30 p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Hey there, thanks for stopping by. Before you dive in,
                    here are the ground rules for using {COMPANY_NAME}. We
                    have tried to keep them clear and fair. In short: you own
                    the content you create, you are responsible for what you
                    publish, AI output is a starting point you should review,
                    and verification is a helpful signal rather than a
                    guarantee. The full terms are below.
                </p>
            </div>

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
                    </section>
                ))}
            </div>
        </div>
    );
};

export default TermsOfServicePage;
