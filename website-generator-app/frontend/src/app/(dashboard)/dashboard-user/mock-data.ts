import type { UUID } from "node:crypto";

import type { UserData } from "@/context/UserContext";
import type { Portfolio } from "@/types/portfolio";

export const DASHBOARD_DEMO_USER: UserData = {
  id: "demo-user-001",
  username: "Randy",
  email: "randy@example.com",
  avatar: null,
};

export const DASHBOARD_MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: "mock-portfolio-001" as UUID,
    title: "Software Engineer Portfolio",
    status: "publish",
    template_id: "developer-dark",
    last_step: "refine",
    slug: "john-doe-dev",
    updated_at: "2026-03-28T14:30:00Z",
    created_at: "2026-03-15T09:00:00Z",
  },
  {
    id: "mock-portfolio-002" as UUID,
    title: "Product Design Showcase",
    status: "draft",
    template_id: "creative-minimal",
    last_step: "review",
    slug: null,
    updated_at: "2026-03-25T11:00:00Z",
    created_at: "2026-03-20T16:45:00Z",
  },
  {
    id: "mock-portfolio-003" as UUID,
    title: "Data Science Portfolio",
    status: "draft",
    template_id: "developer-dark",
    last_step: "upload",
    slug: null,
    updated_at: "2026-03-22T08:15:00Z",
    created_at: "2026-03-18T12:30:00Z",
  },
];
