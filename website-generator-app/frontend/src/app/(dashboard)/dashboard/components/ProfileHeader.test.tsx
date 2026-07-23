// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ProfileHeader from "./ProfileHeader";

const mockBio =
  "Creative designer and developer passionate about building beautiful digital experiences. Specializing in portfolio design and web development.";

describe("ProfileHeader", () => {
  afterEach(cleanup);

  it("does not render a mock biography when the profile bio is empty", () => {
    render(
      <ProfileHeader
        username="Creator"
        avatarUrl={null}
        bio={null}
        showFollowButton={false}
      />,
    );

    expect(screen.queryByText(mockBio)).not.toBeInTheDocument();
  });

  it("renders a real profile biography", () => {
    render(
      <ProfileHeader
        username="Creator"
        avatarUrl={null}
        bio="I build accessible digital products."
        showFollowButton={false}
      />,
    );

    expect(
      screen.getByText("I build accessible digital products."),
    ).toBeVisible();
  });
});
