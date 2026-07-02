import StyleDiscussionClient from "./StyleDiscussionClient";
import { loadInitialStyleChatHistory } from "./style-chat.server";

interface StylePageSearchParams {
    portfolioId?: string | string[];
    templateId?: string | string[];
}

interface StyleDiscussionPageProps {
    searchParams?: Promise<StylePageSearchParams>;
}

const readSingleSearchParam = (
    value: string | string[] | undefined,
): string | null => {
    if (Array.isArray(value)) {
        return value[0]?.trim() || null;
    }

    return value?.trim() || null;
};

const StyleDiscussionPage = async ({
    searchParams,
}: StyleDiscussionPageProps) => {
    const resolvedSearchParams = (await searchParams) ?? {};
    const templateId = readSingleSearchParam(resolvedSearchParams.templateId);
    const portfolioId = readSingleSearchParam(resolvedSearchParams.portfolioId);
    const initialHistory = await loadInitialStyleChatHistory(portfolioId);

    return (
        <StyleDiscussionClient
            templateId={templateId}
            portfolioId={portfolioId}
            initialStyleChatHistory={initialHistory.history}
            isInitialStyleChatHistoryResolved={initialHistory.isResolved}
        />
    );
};

export default StyleDiscussionPage;
