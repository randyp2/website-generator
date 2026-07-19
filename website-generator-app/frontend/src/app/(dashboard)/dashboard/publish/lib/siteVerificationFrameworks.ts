/** Public meta name recognized by PortRN's site ownership verifier. */
export const SITE_VERIFICATION_META_NAME = "portrn-site-verification";

export const SITE_VERIFICATION_FRAMEWORKS = [
    {
        id: "html",
        label: "HTML",
        fileName: "index.html",
        note: "Use the HTML file served at your portfolio URL.",
        accentColor: "#f97316",
    },
    {
        id: "react",
        label: "React",
        fileName: "index.html",
        note: "For Vite, use the project root. Create React App uses public/index.html.",
        accentColor: "#61dafb",
    },
    {
        id: "nextjs",
        label: "Next.js",
        fileName: "app/layout.tsx",
        note: "Place the head element in your root App Router layout.",
        // Next.js is monochrome; follow the theme text color so the "N" stays
        // visible on both light and dark surfaces.
        accentColor: "currentColor",
    },
    {
        id: "vue",
        label: "Vue",
        fileName: "index.html",
        note: "For Vite, use the project root. Vue CLI uses public/index.html.",
        accentColor: "#42b883",
    },
    {
        id: "angular",
        label: "Angular",
        fileName: "src/index.html",
        note: "Use the HTML entry file configured by your Angular build.",
        accentColor: "#ef4444",
    },
] as const;

export type SiteVerificationFramework =
    (typeof SITE_VERIFICATION_FRAMEWORKS)[number]["id"];

export interface SiteVerificationFrameworkGuide {
    id: SiteVerificationFramework;
    label: string;
    fileName: string;
    note: string;
    accentColor: string;
}

/** Converts the server tag into syntax accepted by both HTML and JSX. */
export const makePortableVerificationTag = (verificationTag: string): string => {
    const trimmedTag = verificationTag.trim();
    return trimmedTag.endsWith("/>")
        ? trimmedTag
        : trimmedTag.replace(/>$/, " />");
};

const buildHtmlSnippet = (verificationTag: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    ${verificationTag}
  </head>
  <body>
    <main id="portfolio"></main>
  </body>
</html>`;

const buildReactSnippet = (verificationTag: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    ${verificationTag}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const buildNextJsSnippet = (verificationTag: string): string => `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        ${verificationTag}
      </head>
      <body>{children}</body>
    </html>
  );
}`;

const buildVueSnippet = (verificationTag: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    ${verificationTag}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

const buildAngularSnippet = (verificationTag: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Portfolio</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${verificationTag}
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`;

/** Builds a realistic entry-file example for the selected framework. */
export const buildSiteVerificationSnippet = (
    framework: SiteVerificationFramework,
    verificationTag: string,
): string => {
    const portableTag = makePortableVerificationTag(verificationTag);
    switch (framework) {
        case "react":
            return buildReactSnippet(portableTag);
        case "nextjs":
            return buildNextJsSnippet(portableTag);
        case "vue":
            return buildVueSnippet(portableTag);
        case "angular":
            return buildAngularSnippet(portableTag);
        case "html":
            return buildHtmlSnippet(portableTag);
    }
};

export const findSiteVerificationFramework = (
    framework: SiteVerificationFramework,
): SiteVerificationFrameworkGuide =>
    SITE_VERIFICATION_FRAMEWORKS.find(({ id }) => id === framework) ??
    SITE_VERIFICATION_FRAMEWORKS[0];
