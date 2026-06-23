/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "./App.jsx";

vi.mock("@/contexts/useAuth", () => ({
  default: () => ({
    isAuthenticated: true,
    userRole: "guide",
  }),
}));

vi.mock("@/pages/HomePage.jsx", () => ({
  default: () => <div>Landing page</div>,
}));

vi.mock("@/features/guide/pages/GuideHomePage", () => ({
  default: () => <div>Guide home</div>,
}));

describe("App landing route", () => {
  it("redirects logged in guides away from the landing page", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Guide home")).toBeDefined();
    expect(screen.queryByText("Landing page")).toBeNull();
  });
});