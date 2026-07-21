import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createServerSupabaseClientMock,
  redirectMock,
  revalidatePathMock,
  signInWithPasswordMock,
  signUpMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  redirectMock: vi.fn((path: string): never => {
    throw new Error(`redirect:${path}`);
  }),
  revalidatePathMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signUpMock: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { login, signup } from "./auth-actions";

describe("authentication server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: signInWithPasswordMock,
        signUp: signUpMock,
      },
    });
    signInWithPasswordMock.mockResolvedValue({ error: null });
    signUpMock.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("passes the Turnstile token to password login", async () => {
    const formData = new FormData();
    formData.set("email", "person@example.com");
    formData.set("password", "password123");
    formData.set("captcha_token", "captcha-token");

    await expect(login(formData)).rejects.toThrow(
      "redirect:/auth/post-login",
    );

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "password123",
      options: { captchaToken: "captcha-token" },
    });
  });

  it("passes the Turnstile token and consent metadata to signup", async () => {
    const formData = new FormData();
    formData.set("first-name", "Ava");
    formData.set("last-name", "Johnson");
    formData.set("email", "ava@example.com");
    formData.set("password", "password123");
    formData.set("terms_accepted", "true");
    formData.set("terms_version", "2026-07-12");
    formData.set("captcha_token", "captcha-token");

    await expect(signup(formData)).rejects.toThrow(
      "redirect:/?signup=confirmation-sent",
    );

    expect(signUpMock).toHaveBeenCalledWith({
      email: "ava@example.com",
      password: "password123",
      options: {
        captchaToken: "captcha-token",
        data: {
          full_name: "Ava Johnson",
          email: "ava@example.com",
          terms_accepted: true,
          terms_version: "2026-07-12",
          terms_accepted_at: expect.any(String),
        },
      },
    });
  });

  it("redirects normally when signup immediately creates a session", async () => {
    signUpMock.mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null,
    });

    const formData = new FormData();
    formData.set("first-name", "Ava");
    formData.set("last-name", "Johnson");
    formData.set("email", "ava@example.com");
    formData.set("password", "password123");
    formData.set("terms_accepted", "true");
    formData.set("terms_version", "2026-07-12");
    formData.set("captcha_token", "captcha-token");

    await expect(signup(formData)).rejects.toThrow("redirect:/");
  });

  it("rejects a landing-page submission without a CAPTCHA token", async () => {
    const formData = new FormData();
    formData.set("email", "person@example.com");
    formData.set("password", "password123");

    await expect(login(formData)).rejects.toThrow("redirect:/error");
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });
});
