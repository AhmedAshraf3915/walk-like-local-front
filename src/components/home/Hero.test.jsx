/* @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Hero from "@/features/landingPage/components/Hero.jsx";

vi.mock("@/features/landingPage/components/Navbar", () => ({
  default: () => <div data-testid="hero-navbar" />,
}));

function CurrentLocation() {
  const location = useLocation();
  return (
    <div data-testid="current-location">
      {location.pathname}
      {location.search}
    </div>
  );
}

describe("landing hero", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates to tours with the selected hero filters", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Hero />
        <CurrentLocation />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: /where to/i }));
    fireEvent.click(screen.getByRole("option", { name: "Cairo" }));
    fireEvent.click(screen.getByRole("combobox", { name: /type of tour/i }));
    fireEvent.click(screen.getByRole("option", { name: "Food Tour" }));
    fireEvent.change(screen.getByLabelText("Select Date"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search tours/i }));

    expect(screen.getByTestId("current-location").textContent).toBe(
      "/tours?destination=Cairo&search=Food+Tour&date=2026-07-01",
    );
  });
});
