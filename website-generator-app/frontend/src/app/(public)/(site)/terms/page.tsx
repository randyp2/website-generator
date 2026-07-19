import type { Metadata } from "next";

// Sole proprietorship, so the brand name is the operator. Update
// EFFECTIVE_DATE if you prefer a launch date.
const COMPANY_NAME = "PortRN";
const CONTACT_EMAIL = "portrnco@gmail.com";
const EFFECTIVE_DATE = "July 12, 2026";
const GOVERNING_LAW = "the State of Nevada, United States";

export const metadata: Metadata = {
    title: `Terms of Use | ${COMPANY_NAME}`,
    description: `The terms that govern your use of ${COMPANY_NAME}.`,
};

/** A paragraph, optionally led by a bold inline label (e.g. "Billing."). */
type Paragraph = string | { label: string; text: string };

interface Section {
    id: string;
    heading: string;
    body?: Paragraph[];
    points?: string[];
}

const sections: Section[] = [
    {
        id: "who-we-are",
        heading: "Who we are",
        body: [
            `${COMPANY_NAME} is an AI portfolio generator. We turn your resume and related materials into a publishable personal website, with optional features such as skill verification. ${COMPANY_NAME} is operated as a sole proprietorship.`,
        ],
    },
    {
        id: "registration",
        heading: "Registration and access",
        body: [
            {
                label: "Minimum age.",
                text: "You must be at least 16 years old, or the minimum age required in your country to consent to use the Services. If you are under 18, you must have your parent or legal guardian's permission to use the Services.",
            },
            {
                label: "Registration.",
                text:
                    "You must provide accurate and complete information to register for an account. You may not share your account credentials or make your account available to anyone else, and you are responsible for all activity that occurs under your account. Tell us promptly at " +
                    CONTACT_EMAIL +
                    " if you believe your account has been accessed without permission.",
            },
        ],
    },
    {
        id: "using-services",
        heading: "Using our Services",
        body: [
            {
                label: "What you can do.",
                text: "Subject to your compliance with these Terms, you may access and use our Services. In using our Services, you must comply with all applicable laws and any guidelines or policies we make available to you.",
            },
            {
                label: "What you cannot do.",
                text: "You may not use our Services for any illegal, harmful, or abusive activity. For example, you may not:",
            },
        ],
        points: [
            "Use our Services in a way that infringes, misappropriates, or violates anyone's rights.",
            "Upload content you do not have the right to use, or that is unlawful, deceptive, or misleading.",
            "Misrepresent your identity, experience, or credentials, including in materials you submit for verification.",
            "Modify, copy, lease, sell, or distribute any part of our Services.",
            "Attempt to reverse engineer, decompile, or discover the source code or underlying components of our Services, except where this restriction is prohibited by law.",
            "Interfere with or disrupt our Services, circumvent rate limits, or bypass any protective measures.",
            "Use our Services or their output to build or train a competing product.",
        ],
    },
    {
        id: "third-party",
        heading: "Third party services",
        body: [
            "Our Services may include or connect to third party software, products, or services, such as our AI providers and, when you choose to connect them, services like GitHub. These are subject to their own terms, and we are not responsible for them.",
            {
                label: "Feedback.",
                text: "We appreciate your feedback, and you agree that we may use it without restriction or compensation to you.",
            },
        ],
    },
    {
        id: "content",
        heading: "Content",
        body: [
            {
                label: "Your content.",
                text: 'You may provide input to the Services, such as your resume, media, and instructions ("Input"), and receive generated results based on that input ("Output"). Input and Output are together your "Content." You are responsible for your Content, including making sure it does not violate any law or these Terms. You represent that you have all rights and permissions needed to provide your Input.',
            },
            {
                label: "Ownership.",
                text: "As between you and us, and to the extent permitted by law, you keep ownership of your Input and you own the Output you create with the Services. We claim no ownership of your Content.",
            },
            {
                label: "Our use of content.",
                text: "We use your Content to provide, maintain, and improve the Services, to comply with the law, and to keep the Services safe. This includes sending relevant Content to the third party AI providers described in our Privacy Policy so we can generate your results.",
            },
        ],
    },
    {
        id: "accuracy",
        heading: "Accuracy of AI output",
        body: [
            "Our Services use artificial intelligence to generate and refine content. Given the nature of machine learning, Output may not always be accurate, complete, original, or suited to your purpose. When you use our Services you understand and agree that:",
        ],
        points: [
            "Output may not always be accurate, and you should not rely on it as a sole source of truth or as a substitute for professional advice.",
            "You are responsible for reviewing and editing Output for accuracy and appropriateness before you rely on it or publish it.",
            "You must not use Output about a person for any purpose that could have a legal or material impact on them, such as employment, credit, housing, insurance, or similar decisions.",
            "Output may be incomplete or incorrect and does not represent our views.",
        ],
    },
    {
        id: "verification",
        heading: "Skill verification",
        body: [
            "Our verification feature produces an automated, heuristic signal based on the evidence you provide, such as uploads and connected accounts. It is an estimate, not a guarantee. It is not a background check, a certification, an endorsement, or a professional assessment of anyone's abilities.",
            "You should not treat a verification result as proof of a person's skills or qualifications, and you agree not to present it to others as such. We are not responsible for decisions you or anyone else makes based on a verification result.",
        ],
    },
    {
        id: "our-ip",
        heading: "Our IP rights",
        body: [
            `We own all rights, title, and interest in and to the Services, including our software, design, and branding. These Terms do not grant you any rights to our intellectual property except the limited right to use the Services as allowed here. You may only use our name and logo with our permission.`,
        ],
    },
    {
        id: "paid-accounts",
        heading: "Paid accounts",
        body: [
            {
                label: "Billing.",
                text: "If you purchase any Services, you will provide complete and accurate billing information and a valid payment method. Payments are processed by Stripe, and by paying you also agree to Stripe's terms. For paid subscriptions, we will automatically charge your payment method on each renewal until you cancel. You are responsible for applicable taxes. We do not store your full payment card details.",
            },
            {
                label: "Credits.",
                text: "You can pay for some Services in advance by purchasing credits. Credits are consumed as you use the applicable features.",
            },
            {
                label: "Cancellation and refunds.",
                text:
                    "You can cancel your subscription at any time from your billing settings, and cancellation takes effect at the end of the current billing period. Payments are non-refundable except where required by law. These Terms do not override any mandatory local laws about your cancellation rights. If you believe you were charged in error, contact us at " +
                    CONTACT_EMAIL +
                    " and we will review it in good faith.",
            },
            {
                label: "Price changes.",
                text: "We may change our prices from time to time. If we increase a subscription price, we will give you at least 30 days notice, and the increase will take effect on your next renewal so you can cancel if you do not agree.",
            },
        ],
    },
    {
        id: "termination",
        heading: "Termination and suspension",
        body: [
            "You are free to stop using our Services at any time, and you can ask us to delete your account by contacting us at " +
                CONTACT_EMAIL +
                ". We may suspend or end your access, or delete your account, if you breach these Terms, if we are required to by law, or if your use could cause risk or harm to us, our users, or anyone else. When your account ends, the sections of these Terms that by their nature should survive will continue to apply.",
        ],
    },
    {
        id: "discontinuation",
        heading: "Discontinuation of Services",
        body: [
            "We may decide to discontinue the Services. If we do, we will give you advance notice where reasonable and a refund for any prepaid, unused Services.",
        ],
    },
    {
        id: "disclaimer",
        heading: "Disclaimer of warranties",
        body: [
            'OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." EXCEPT TO THE EXTENT PROHIBITED BY LAW, WE MAKE NO WARRANTIES (EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE) WITH RESPECT TO THE SERVICES, AND WE DISCLAIM ALL WARRANTIES INCLUDING, BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ACCURATE, OR ERROR FREE, OR THAT ANY CONTENT WILL BE SECURE OR NOT LOST OR ALTERED.',
            "YOU ACCEPT AND AGREE THAT ANY USE OF OUTPUT FROM OUR SERVICES IS AT YOUR SOLE RISK, AND YOU WILL NOT RELY ON OUTPUT AS A SOLE SOURCE OF TRUTH OR FACTUAL INFORMATION, OR AS A SUBSTITUTE FOR PROFESSIONAL ADVICE.",
        ],
    },
    {
        id: "liability",
        heading: "Limitation of liability",
        body: [
            "WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, OR DATA, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY UNDER THESE TERMS WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID FOR THE SERVICE THAT GAVE RISE TO THE CLAIM DURING THE 12 MONTHS BEFORE THE LIABILITY AROSE, OR ONE HUNDRED DOLLARS (100 USD). THESE LIMITS APPLY ONLY TO THE MAXIMUM EXTENT PERMITTED BY LAW.",
            "Some states do not allow the disclaimer of certain warranties or the limitation of certain damages, so some of the terms above may not apply to you, and you may have additional rights.",
        ],
    },
    {
        id: "indemnification",
        heading: "Indemnification",
        body: [
            "To the extent permitted by law, you will indemnify and hold us harmless from any costs, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from third party claims relating to the content you publish through the Services, your misuse of the Services, or your violation of these Terms or of anyone else's rights.",
        ],
    },
    {
        id: "copyright",
        heading: "Copyright complaints",
        body: [
            "If you believe content on the Services infringes your copyright, send a notice to " +
                CONTACT_EMAIL +
                " that includes your contact information, a description of the copyrighted work, where the allegedly infringing material is located, a statement that you have a good-faith belief the use is not authorized, and a statement, under penalty of perjury, that the information is accurate and that you are authorized to act for the copyright owner. We may remove content we believe is infringing and may terminate repeat infringers.",
        ],
    },
    {
        id: "general",
        heading: "General terms",
        body: [
            {
                label: "Assignment.",
                text: "You may not assign or transfer any rights or obligations under these Terms, and any attempt to do so will be void. We may assign our rights and obligations under these Terms in connection with a merger, acquisition, or sale of assets.",
            },
            {
                label: "Changes to these Terms.",
                text: "We may update these Terms from time to time, for example due to changes in the law, for security reasons, or as we develop the Services. We will give at least 30 days advance notice of changes that materially and adversely affect you, by email or an in-product notice. Other changes take effect when we post them. If you do not agree to the changes, you must stop using the Services.",
            },
            {
                label: "Severability and waiver.",
                text: "Our failure to enforce a provision is not a waiver of our right to do so later. If any part of these Terms is found invalid or unenforceable, that part will be enforced to the maximum extent permitted and the rest will remain in effect.",
            },
            {
                label: "Entire agreement.",
                text: "These Terms are the entire agreement between you and us regarding the Services and supersede any prior agreements between us on that subject.",
            },
            {
                label: "Governing law.",
                text: `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-laws rules. Any claim arising out of or relating to these Terms or the Services will be brought exclusively in the state or federal courts located in Nevada, and you consent to their jurisdiction.`,
            },
        ],
    },
    {
        id: "contact",
        heading: "Contact us",
        body: [
            `Questions about these Terms? Reach us any time at ${CONTACT_EMAIL}.`,
        ],
    },
];

const renderParagraph = (paragraph: Paragraph, key: number) => (
    <p
        key={key}
        className="mt-3 text-sm leading-relaxed text-muted-foreground"
    >
        {typeof paragraph === "string" ? (
            paragraph
        ) : (
            <>
                <strong className="font-medium text-foreground">
                    {paragraph.label}
                </strong>{" "}
                {paragraph.text}
            </>
        )}
    </p>
);

const TermsOfUsePage = () => {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16">
            <header className="mb-12">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Terms of Use
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Effective {EFFECTIVE_DATE}
                </p>
            </header>

            <div className="mb-12 rounded-xl border border-border bg-muted/30 p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Hey there, thanks for stopping by. Before you dive in, here
                    are the ground rules for using {COMPANY_NAME}. We have tried
                    to keep them clear and fair. In short: you own the content
                    you create, you are responsible for what you publish, AI
                    output is a starting point you should review, and
                    verification is a helpful signal rather than a guarantee.
                    The full terms are below, and by using {COMPANY_NAME} you
                    agree to them.
                </p>
            </div>

            <div className="space-y-10">
                {sections.map((section) => (
                    <section key={section.id} id={section.id}>
                        <h2 className="text-xl font-semibold tracking-tight">
                            {section.heading}
                        </h2>
                        {section.body?.map((paragraph, i) =>
                            renderParagraph(paragraph, i),
                        )}
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

export default TermsOfUsePage;
