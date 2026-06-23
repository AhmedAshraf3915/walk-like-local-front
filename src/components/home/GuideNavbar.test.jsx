/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import GuideNavbar from "@/components/home/GuideNavbar";

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({ user: { _id: "guide-1" } }),
}));

vi.mock(
  "@/features/guideVerification/hooks/useGuideVerificationStatus",
  () => ({
    useGuideVerificationStatus: () => ({
      isVerified: false,
      isLoading: false,
      verification: {},
    }),
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
  });

  it("keeps the brand linked to the landing page and removes the separate landing item", () => {
    renderNavbar({ verified: true });

    expect(
      screen.getByRole("link", { name: /walk like a local/i }).getAttribute("href"),
    ).toBe("/");
    expect(screen.queryByRole("link", { name: "Landing" })).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "Explore tours" })[0].getAttribute("href"),
    ).toBe("/tours");
    expect(
      screen.getAllByRole("link", { name: "Guide home" })[0].getAttribute("href"),
    ).toBe("/guide");
    expect(
      screen.getAllByRole("link", { name: "Create tour" })[0].getAttribute("href"),
    ).toBe("/guide/tours/new");
  });

  it("directs an unverified guide to profile completion", () => {
    renderNavbar({ verified: false });

    expect(
      screen.getAllByRole("link", { name: "Complete profile" })[0].getAttribute("href"),
    ).toBe("/guide/complete-profile");
  });
});
