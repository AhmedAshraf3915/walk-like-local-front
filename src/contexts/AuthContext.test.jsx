/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AuthProvider } from "@/contexts/AuthContext.jsx";
import useAuth from "@/contexts/useAuth";

function AuthStateProbe() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <p>
      {isAuthenticated ? "Authenticated" : "Guest"}:{userRole ?? "none"}
    </p>
  );
}

describe("AuthProvider persisted session", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("keeps a valid guide session when the landing page mounts", async () => {
    localStorage.setItem("accessToken", "valid-guide-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ _id: "guide-1", role: "guide", fullName: "Marwa" }),
    );

    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText("Authenticated:guide")).toBeDefined();
    expect(localStorage.getItem("accessToken")).toBe("valid-guide-token");
  });
});
