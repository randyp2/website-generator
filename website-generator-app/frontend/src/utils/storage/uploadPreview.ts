import { v4 as uuidv4 } from "uuid";

/**
 * Prepare the generated HTML as a downloadable file.
 * This no longer uploads anywhere — it's used for email attachment.
 */
export async function prepareAnonymousPreview(html: string) {
  const id = uuidv4();
  const fileName = `portfolio-preview-${id}.html`;

  return {
    id,
    fileName,
    fileContent: html,
  };
}
