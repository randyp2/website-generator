export interface Version {
    id: string;
    created_at: string;
    assistant_message: string | null;
    prompt_used: string | null;
    preview_url: string | null;
    is_active: boolean;
}
