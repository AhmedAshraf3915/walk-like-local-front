/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HeroSection from "@/components/home/HeroSection.jsx";
import Navbar from "@/components/home/Navbar.jsx";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";

const authMock = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    user: null,
    userRole: null,
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  default: () => authMock.state,
}));

function CurrentLocation() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}{location.search}</div>;
}

describe("landing page header", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    authMock.state = {
      isAuthenticated: false,
      user: null,
      userRole: null,
    };
  });

  it("shows the sign-up and login action", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const authAction = screen.getByRole("link", {
      name: /sign up \/ log in/i,
    });

    expect(authAction.getAttribute("href")).toBe("/signup");
    expect(authAction.className).toContain("inline-flex");
    expect(authAction.className).not.toContain("hidden");
    expect(screen.getAllByText("Explore Trips").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Profile" })).toBeNull();
  });

  it("uses the authenticated user's uploaded image", () => {
    authMock.state = {
      isAuthenticated: true,
      userRole: "guide",
      user: {
        fullName: "Nour Hassan",
        profilePhoto: { secureUrl: "https://images.example/nour.jpg" },
      },
    };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("Nour Hassan profile").getAttribute("src")).toBe(
      "https://images.example/nour.jpg",
    );
  });

  it("offers every Egyptian governorate in the styled destination select", () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );

    const destinationSelect = screen.getByRole("combobox", {
      name: /where to/i,
    });

    expect(destinationSelect.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(destinationSelect);
    expect(destinationSelect.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option")).toHaveLength(
      EGYPT_GOVERNORATES.length + 1,
    );

    for (const governorate of EGYPT_GOVERNORATES) {
      expect(
        screen.getByRole("option", { name: governorate }),
      ).toBeDefined();
    }
  });

  it("submits the hero selections as a tour search", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HeroSection />
        <CurrentLocation />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: /where to/i }));
    fireEvent.click(screen.getByRole("option", { name: "Cairo" }));
    fireEvent.click(
      screen.getByRole("combobox", { name: /type of tour/i }),
    );
    fireEvent.click(screen.getByRole("option", { name: "Food Tour" }));
    fireEvent.click(screen.getByRole("button", { name: /search tours/i }));

    expect(screen.getByTestId("current-location").textContent).toBe(
      "/tours?destination=Cairo&search=Food+Tour",
    );
  });
});
