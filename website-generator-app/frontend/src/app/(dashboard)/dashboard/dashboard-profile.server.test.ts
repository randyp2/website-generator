import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    createServerSupabaseClientMock,
    fetchBackendMock,
    getSessionMock,
    getUserMock,
} = vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    fetchBackendMock: vi.fn(),
    getSessionMock: vi.fn(),
    getUserMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
    redirect: vi.fn((path: string) => {
        throw new Error(`Unexpected redirect to ${path}`);
    }),
}));
vi.mock("@/lib/api/backendFetch", () => ({
    fetchBackend: fetchBackendMock,
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { getDashboardProfileState } from "./dashboard-profile.server";

describe("getDashboardProfileState", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createServerSupabaseClientMock.mockResolvedValue({
            auth: {
                getSession: getSessionMock,
                getUser: getUserMock,
            },
        });
        getUserMock.mockResolvedValue({
            data: {
                user: {
                    id: "user-1",
                    email: "person@example.com",
                    user_metadata: { full_name: "Person Example" },
                },
            },
        });
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
        });
        fetchBackendMock.mockResolvedValue(
            Response.json({
                username: "person",
                onboardingComplete: true,
            }),
        );
    });

    it("loads the profile through the credentialed backend helper", async () => {
        const state = await getDashboardProfileState();

        expect(fetchBackendMock).toHaveBeenCalledWith(
            "/api/v1/profile/me",
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer access-token",
                },
                cache: "no-store",
            },
        );
        expect(state.authUser).toEqual({
            avatarUrl: null,
            email: "person@example.com",
            fullName: "Person Example",
            id: "user-1",
        });
        expect(state.profile.email).toBe("person@example.com");
    });
});
