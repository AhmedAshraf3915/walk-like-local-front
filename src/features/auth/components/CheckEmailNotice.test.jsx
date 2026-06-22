/* @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CheckEmailNotice from "@/features/auth/components/CheckEmailNotice";

describe("CheckEmailNotice", () => {
  it("shows a friendly warning and a readable resend countdown", () => {
    render(
      <CheckEmailNotice
        initialEmail="guide@example.com"
        loading={false}
        apiError={null}
        successMessage={null}
        resendCooldownSeconds={10748}
        onResend={vi.fn()}
      />,
    );

    const resendButton = screen.getByRole("button", {
      name: /try again in 2:59:08/i,
    });

    expect(resendButton.disabled).toBe(true);
    expect(
      screen.getByText(/a verification email is already on its way/i),
    ).toBeTruthy();
    expect(screen.queryByText(/10748 seconds/i)).toBeNull();
  });
});
