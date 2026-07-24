// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { consumePortfolioUploadSelection } from "./portfolioUploadSelection";

const createLiveFileInput = (files: File[]): HTMLInputElement => {
    const selectedFiles = [...files];
    let value = selectedFiles.length > 0 ? "C:\\fakepath\\selected-file" : "";

    return {
        get files() {
            return selectedFiles as unknown as FileList;
        },
        get value() {
            return value;
        },
        set value(nextValue: string) {
            value = nextValue;
            if (nextValue === "") {
                selectedFiles.length = 0;
            }
        },
    } as HTMLInputElement;
};

describe("consumePortfolioUploadSelection", () => {
    it("copies valid files before resetting the browser input", () => {
        const resume = new File(["resume"], "resume.pdf", {
            type: "application/pdf",
        });
        const input = createLiveFileInput([resume]);

        const result = consumePortfolioUploadSelection(input, "resume");

        expect(result.acceptedFiles).toHaveLength(1);
        expect(result.acceptedFiles[0].file).toBe(resume);
        expect(result.rejectedMessages).toEqual([]);
        expect(input.files).toHaveLength(0);
        expect(input.value).toBe("");
    });

    it("returns actionable validation errors for rejected files", () => {
        const video = new File(["video"], "demo.mp4", {
            type: "video/mp4",
        });
        Object.defineProperty(video, "size", {
            configurable: true,
            value: 50 * 1024 * 1024 + 1,
        });
        const input = createLiveFileInput([video]);

        const result = consumePortfolioUploadSelection(input, "video");

        expect(result.acceptedFiles).toEqual([]);
        expect(result.rejectedMessages).toEqual([
            "demo.mp4: File is too large (50.0MB). Max video size is 50MB",
        ]);
        expect(input.files).toHaveLength(0);
    });
});
