/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import GuideNavbar from "@/components/home/GuideNavbar";

const verificationState = vi.hoisted(() => ({
  isVerified: false,
  isLoading: false,
  verification: {},
}));

const authState = vi.hoisted(() => ({
  user: { _id: "guide-1" },
  userRole: "guide",
  isAuthenticated: true,
  logout: vi.fn(),
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => authState,
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    readGuideVerificationStatus: () => "none",
    useGuideVerificationStatus: () => verificationState,
  }),
);

const renderNavbar = (props = {}) =>
  render(
    <MemoryRouter initialEntries={["/guide/profile"]}>
      <GuideNavbar {...props} />
    </MemoryRouter>,
  );

describe("GuideNavbar", () => {
  afterEach(() => {
    cleanup();
    verificationState.isVerified = false;
    verificationState.isLoading = false;
    authState.userRole = "guide";
    authState.isAuthenticated = true;
  });

  it("keeps the brand linked to the landing page and removes the separate landing item", () => {
    renderNavbar({ verified: true });

    expect(
      screen
        .getByRole("link", { name: /walk like a local/i })
        .getAttribute("href"),
    ).toBe("/");
    expect(screen.queryByRole("link", { name: "Landing" })).toBeNull();
    expect(
      screen
        .getAllByRole("link", { name: "Explore tours" })[0]
        .getAttribute("href"),
    ).toBe("/tours");
    expect(
      screen
        .getAllByRole("link", { name: "Guide home" })[0]
        .getAttribute("href"),
    ).toBe("/guide");
    expect(
      screen
        .getAllByRole("link", { name: "Create tour" })[0]
        .getAttribute("href"),
    ).toBe("/guide/tours/new");
  });

  it("directs an unverified guide to profile completion", () => {
    renderNavbar({ verified: false });

    expect(
      screen
        .getAllByRole("link", { name: "Complete profile" })[0]
        .getAttribute("href"),
    ).toBe("/guide/complete-profile");
  });

  it("does not show guide action while verification status is loading", () => {
    verificationState.isLoading = true;

    renderNavbar();

    expect(screen.queryByRole("link", { name: "Create tour" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Complete profile" })).toBeNull();
  });
});
