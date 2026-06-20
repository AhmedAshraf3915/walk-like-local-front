import { beforeEach, describe, expect, it, vi } from "vitest";

import { guidesApi } from "@/features/guide/api/guidesApi";
import { toursApi } from "@/features/tours/api/toursApi";

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: apiClientMocks,
}));

describe("landing page APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClientMocks.get.mockResolvedValue({ data: { success: true, data: [] } });
  });

  it("uses the public Browse Active Tours endpoint", async () => {
    await toursApi.browseActiveTours({ page: 1, limit: 3 });

    expect(apiClientMocks.get).toHaveBeenCalledWith("/tours", {
      params: {
        page: 1,
        limit: 3,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      timeout: 60000,
    });
  });

  it("uses the public guides endpoint from Guide complete profile", async () => {
    await guidesApi.getPublicGuides({ page: 1, limit: 3 });

    expect(apiClientMocks.get).toHaveBeenCalledWith("/guides", {
      params: { page: 1, limit: 3 },
      timeout: 60000,
    });
  });
});
