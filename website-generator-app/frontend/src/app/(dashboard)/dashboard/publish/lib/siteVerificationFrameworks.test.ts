import { describe, expect, it } from "vitest";

import {
    buildSiteVerificationSnippet,
    findSiteVerificationFramework,
    makePortableVerificationTag,
    SITE_VERIFICATION_FRAMEWORKS,
} from "./siteVerificationFrameworks";

describe("site verification framework guidance", () => {
    it("makes the backend meta tag portable across HTML and JSX", () => {
        expect(
            makePortableVerificationTag(
                '<meta name="webgen-site-verification" content="wg_v1_token">',
            ),
        ).toBe(
            '<meta name="webgen-site-verification" content="wg_v1_token" />',
        );
    });

    it("does not add a second slash to a portable tag", () => {
        expect(
            makePortableVerificationTag(
                '<meta name="webgen-site-verification" content="wg_v1_token" />',
            ),
        ).toBe(
            '<meta name="webgen-site-verification" content="wg_v1_token" />',
        );
    });

    it("builds a realistic React entry file containing the tag", () => {
        const snippet = buildSiteVerificationSnippet(
            "react",
            '<meta name="webgen-site-verification" content="token">',
        );

        expect(snippet).toContain("<!doctype html>");
        expect(snippet).toContain('<div id="root"></div>');
        expect(snippet).toContain('src="/src/main.tsx"');
        expect(snippet).toContain(
            '<meta name="webgen-site-verification" content="token" />',
        );
    });

    it("builds an example containing the tag for every framework", () => {
        for (const framework of SITE_VERIFICATION_FRAMEWORKS) {
            expect(
                buildSiteVerificationSnippet(
                    framework.id,
                    '<meta name="webgen-site-verification" content="token">',
                ),
            ).toContain("webgen-site-verification");
        }
    });

    it("returns the selected framework file guidance", () => {
        expect(findSiteVerificationFramework("angular").fileName)
            .toBe("src/index.html");
    });
});
