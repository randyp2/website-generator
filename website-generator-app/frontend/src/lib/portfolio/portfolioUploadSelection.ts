import type { UploadedFile } from "@/types/file";

import type { PortfolioUploadKind } from "./portfolioUploadClient";
import { validatePortfolioUploadFile } from "./portfolioUploadPolicy";

export interface PortfolioUploadSelection {
    acceptedFiles: UploadedFile[];
    rejectedMessages: string[];
}

/**
 * Consumes the current browser file selection and resets the input so the same
 * file can be selected again.
 */
export const consumePortfolioUploadSelection = (
    input: HTMLInputElement,
    kind: PortfolioUploadKind,
): PortfolioUploadSelection => {
    const selectedFiles = Array.from(input.files ?? []);
    input.value = "";

    const acceptedFiles: UploadedFile[] = [];
    const rejectedMessages: string[] = [];
    for (const file of selectedFiles) {
        const validationError = validatePortfolioUploadFile(kind, file);
        if (validationError) {
            rejectedMessages.push(`${file.name}: ${validationError}`);
            continue;
        }
        acceptedFiles.push({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            title: "",
            description: "",
        });
    }

    return { acceptedFiles, rejectedMessages };
};
