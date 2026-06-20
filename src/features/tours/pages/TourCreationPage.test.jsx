/* @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TourCreationPage from "@/features/tours/pages/TourCreationPage";
import { toursApi } from "@/features/tours/api/toursApi";

vi.mock("@/features/tours/api/toursApi", () => ({
  toursApi: {
    uploadImage: vi.fn(async (file) => ({
      secureUrl: `https://res.cloudinary.com/demo/image/upload/${file.name}`,
      publicId: `tours/${file.name}`,
    })),
    createTour: vi.fn(async () => ({ id: "tour-1" })),
  },
}));

vi.mock("@/features/tours/components/MeetingPointMap", () => ({
  default: ({ value, onChange }) => (
    <button
      type="button"
      aria-label="Choose meeting point"
      onClick={() => onChange("29.977300, 31.132500")}
    >
      {value || "Map meeting point"}
    </button>
  ),
}));

vi.mock("@/components/home/GuideNavbar.jsx", () => ({
  default: () => <div>Guide navigation</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <TourCreationPage />
    </MemoryRouter>,
  );

const getOptionalActivitiesSection = () =>
  screen.getByText("Optional activities").closest("section");

const getPackagePricingSection = () =>
  screen.getByText("Package pricing").closest("section");

const fillInput = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("TourCreationPage optional activities", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows person ranges in package pricing and validates slot dates", () => {
    const { container } = renderPage();

    const destinationSelect = screen.getByRole("combobox", {
      name: "Destination",
    });
    expect(destinationSelect.options).toHaveLength(28);
    expect(within(destinationSelect).getByText("Cairo")).toBeDefined();
    expect(within(destinationSelect).getByText("South Sinai")).toBeDefined();

    const pricingSection = getPackagePricingSection();
    expect(within(pricingSection).getByText("1 person")).toBeDefined();
    expect(within(pricingSection).getByText("2-4 person")).toBeDefined();
    expect(within(pricingSection).getByText("5-8 person")).toBeDefined();

    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput.getAttribute("min")).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    fillInput(dateInput, "2000-01-01");
    const timeInputs = container.querySelectorAll('input[type="time"]');
    fillInput(timeInputs[0], "18:00");
    fillInput(timeInputs[1], "21:00");
    fireEvent.click(screen.getByText("Add slot"));

    expect(
      screen.getByText("Choose today or a future date for this slot."),
    ).toBeDefined();
    expect(screen.getByLabelText("Saved time slot count").textContent).toBe(
      "0 time slots",
    );
  });

  it("removes leading zeroes from price inputs", () => {
    renderPage();

    const packagePricing = getPackagePricingSection();
    const packagePrice = within(packagePricing).getAllByPlaceholderText("0")[0];
    fillInput(packagePrice, "007");
    expect(packagePrice.value).toBe("7");

    const activities = getOptionalActivitiesSection();
    const activityPrice = within(activities).getAllByPlaceholderText("0")[0];
    fillInput(activityPrice, "0035");
    expect(activityPrice.value).toBe("35");

    fillInput(activityPrice, "0.5");
    expect(activityPrice.value).toBe("0.5");
  });

  it("supports add, save to container, discard, and remove", () => {
    renderPage();

    const section = getOptionalActivitiesSection();
    const firstNameInput = within(section).getByPlaceholderText("Activity Name");

    expect(firstNameInput).toBeDefined();
    expect(within(section).queryByRole("switch")).toBeNull();
    expect(within(section).queryByText(/Tourist can opt-out/i)).toBeNull();

    fireEvent.click(within(section).getByText("Save Activity"));
    expect(
      screen.getByText(
        "Complete the activity name, description, and all three prices before saving it.",
      ),
    ).toBeDefined();

    fillInput(firstNameInput, "Sunset Boat Tour");
    fillInput(
      within(section).getByPlaceholderText("Short Description"),
      "A two-hour cruise around the bay.",
    );
    within(section)
      .getAllByPlaceholderText("0")
      .forEach((input, index) => fillInput(input, ["120", "50", "35"][index]));

    fireEvent.click(within(section).getByText("Save Activity"));
    expect(screen.getByText("Activity added to saved activities.")).toBeDefined();
    expect(within(section).getByLabelText("Saved activities")).toBeDefined();
    expect(screen.getByText("Sunset Boat Tour")).toBeDefined();
    expect(within(section).getByPlaceholderText("Activity Name").value).toBe("");

    fireEvent.click(within(section).getByText("Add activity"));
    expect(within(section).getAllByPlaceholderText("Activity Name")).toHaveLength(
      2,
    );
    expect(within(section).queryByLabelText("Remove activity")).toBeNull();

    fireEvent.click(within(section).getAllByText("Discard")[1]);
    expect(within(section).getAllByPlaceholderText("Activity Name")).toHaveLength(
      1,
    );

    fireEvent.click(within(section).getByText("Discard"));
    expect(within(section).getByPlaceholderText("Activity Name").value).toBe("");

    fireEvent.click(
      within(section).getByLabelText("Remove saved activity Sunset Boat Tour"),
    );
    expect(within(section).queryByText("Sunset Boat Tour")).toBeNull();
  });

  it("edits a saved activity without duplicating it", () => {
    renderPage();

    const section = getOptionalActivitiesSection();
    fillInput(
      within(section).getByPlaceholderText("Activity Name"),
      "Sunset Boat Tour",
    );
    fillInput(
      within(section).getByPlaceholderText("Short Description"),
      "A two-hour cruise around the bay.",
    );
    within(section)
      .getAllByPlaceholderText("0")
      .forEach((input, index) => fillInput(input, ["120", "50", "35"][index]));
    fireEvent.click(within(section).getByText("Save Activity"));

    fireEvent.click(
      within(section).getByLabelText("Edit saved activity Sunset Boat Tour"),
    );
    const nameInput = within(section).getByPlaceholderText("Activity Name");
    expect(nameInput.value).toBe("Sunset Boat Tour");

    fillInput(nameInput, "Private Sunset Cruise");
    fireEvent.click(within(section).getByText("Update Activity"));

    expect(screen.getByText("Saved activity updated.")).toBeDefined();
    expect(within(section).getByText("Private Sunset Cruise")).toBeDefined();
    expect(within(section).queryByText("Sunset Boat Tour")).toBeNull();
    expect(
      within(section).getByLabelText("Saved activities").children,
    ).toHaveLength(1);
  });

  it("publishes complete activity data in the backend payload", async () => {
    const { container } = renderPage();

    fillInput(screen.getByPlaceholderText("Title"), "Pyramids Night Walk");
    fillInput(screen.getByRole("combobox", { name: "Destination" }), "Giza");
    expect(screen.queryByPlaceholderText("Meeting point")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Choose meeting point" }),
    );
    expect(screen.queryByPlaceholderText("Duration (hours)")).toBeNull();
    fillInput(
      screen.getByPlaceholderText("Description"),
      "Experience the Pyramids of Giza under the stars.",
    );

    screen
      .getAllByPlaceholderText("0")
      .slice(0, 3)
      .forEach((input, index) => fillInput(input, ["150", "80", "50"][index]));

    const coverInput = container.querySelector('input[type="file"]');
    fireEvent.change(coverInput, {
      target: {
        files: [new File(["cover"], "cover.jpg", { type: "image/jpeg" })],
      },
    });

    await waitFor(() => expect(toursApi.uploadImage).toHaveBeenCalledTimes(1));

    fillInput(container.querySelector('input[type="date"]'), "2099-08-01");
    const timeInputs = container.querySelectorAll('input[type="time"]');
    fillInput(timeInputs[0], "18:00");
    fillInput(timeInputs[1], "21:00");
    fireEvent.click(screen.getByText("Add slot"));
    expect(screen.getByLabelText("Saved time slot count").textContent).toBe(
      "1 time slot",
    );
    expect(screen.getByText("3 hours")).toBeDefined();

    const section = getOptionalActivitiesSection();
    fillInput(
      within(section).getByPlaceholderText("Activity Name"),
      "Sunset Boat Tour",
    );
    fillInput(
      within(section).getByPlaceholderText("Short Description"),
      "A breathtaking cruise with refreshments.",
    );
    within(section)
      .getAllByPlaceholderText("0")
      .forEach((input, index) => fillInput(input, ["120", "50", "35"][index]));
    fireEvent.click(within(section).getByText("Save Activity"));

    fireEvent.click(screen.getByRole("button", { name: "Publish tour" }));

    await waitFor(() => expect(toursApi.createTour).toHaveBeenCalledTimes(1));

    const payload = toursApi.createTour.mock.calls[0][0];

    expect(payload.activities).toEqual([
      {
        name: "Sunset Boat Tour",
        description: "A breathtaking cruise with refreshments.",
        pricing: {
          PRIVATE: 120,
          SMALL_GROUP: 50,
          LARGE_GROUP: 35,
        },
        removable: true,
      },
    ]);
    expect(payload.duration).toBe("3 hours");
    expect(payload.slots).toEqual([
      {
        date: "2099-08-01",
        startTime: "18:00",
        endTime: "21:00",
      },
    ]);
    expect(payload.galleryImages).toBeUndefined();
    expect(payload.destination).toBe("Giza");
    expect(payload.meetingPoint).toBe("29.977300, 31.132500");
  });
});
