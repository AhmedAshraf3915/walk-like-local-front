import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";
import Footer from "@/components/home/Footer.jsx";
import GuideNavbar from "@/components/home/GuideNavbar.jsx";
import { toursApi } from "@/features/tours/api/toursApi";
import { EGYPT_GOVERNORATES } from "@/features/tours/constants/tourOptions";
import MeetingPointMap from "@/features/tours/components/MeetingPointMap";

const GROUP_TYPES = [
  { key: "PRIVATE", label: "Private", range: "1 person", icon: User },
  { key: "SMALL_GROUP", label: "Small group", range: "2-4 person", icon: Users },
  { key: "LARGE_GROUP", label: "Large group", range: "5-8 person", icon: Users },
];

const emptyPricing = {
  PRIVATE: "",
  SMALL_GROUP: "",
  LARGE_GROUP: "",
};

const initialTourForm = {
  title: "",
  destination: "",
  meetingPoint: "",
  description: "",
  pricing: { ...emptyPricing },
};

const createClientId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyActivity = () => ({
  id: createClientId(),
  name: "",
  description: "",
  removable: true,
  pricing: { ...emptyPricing },
});

const toNumber = (value) => {
  const numericValue = Number.parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeNumberInput = (value) =>
  value === "" ? "" : value.replace(/^0+(?=\d)/, "");

const toNumericPricing = (pricing) =>
  Object.fromEntries(
    Object.entries(pricing).map(([key, value]) => [key, toNumber(value)]),
  );

const hasAnyPositivePrice = (pricing) =>
  Object.values(pricing).some((value) => toNumber(value) > 0);

const hasAllPositivePrices = (pricing) =>
  GROUP_TYPES.every((groupType) => toNumber(pricing[groupType.key]) > 0);

const hasActivityInput = (activity) =>
  Boolean(activity.name.trim()) ||
  Boolean(activity.description.trim()) ||
  hasAnyPositivePrice(activity.pricing);

const isActivityComplete = (activity) =>
  Boolean(activity.name.trim()) &&
  Boolean(activity.description.trim()) &&
  hasAllPositivePrices(activity.pricing);

const toActivityPayload = (activity) => ({
  name: activity.name.trim(),
  description: activity.description.trim(),
  pricing: toNumericPricing(activity.pricing),
  removable: Boolean(activity.removable),
});

const formatPrice = (value) => toNumber(value).toLocaleString("en-US");

const toDateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getTodayDateInputValue = () => toDateInputValue(new Date());

const isDateBeforeToday = (date) =>
  Boolean(date) && date < getTodayDateInputValue();

const getSlotDurationMinutes = (slot = {}) => {
  const { date, startTime, endTime } = slot;

  if (!date || !startTime || !endTime) {
    return 0;
  }

  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    durationMinutes <= 0
  ) {
    return 0;
  }

  return durationMinutes;
};

const isValidSlotRange = (slot) => getSlotDurationMinutes(slot) > 0;

const formatSlotDuration = (durationMinutes) => {
  if (!durationMinutes) {
    return "";
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${
      minutes === 1 ? "" : "s"
    }`;
  }

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

const getSlotDurationLabel = (slot) =>
  formatSlotDuration(getSlotDurationMinutes(slot));

const getSlotCountLabel = (slotCount) =>
  `${slotCount} time slot${slotCount === 1 ? "" : "s"}`;

const getDerivedTourDuration = (slots) => getSlotDurationLabel(slots[0]);

function SavedActivityCard({ activity, onEdit, onRemove }) {
  return (
    <article className="rounded-2xl border border-[#e1e0ed] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.08)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#010138] text-[#EDC84C] shadow-[0_5px_14px_rgba(1,1,56,0.18)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#010138]">
              {activity.name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#353572]">
              {activity.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(activity)}
            aria-label={`Edit saved activity ${activity.name}`}
            className="grid h-10 w-10 place-items-center rounded-full text-[#353572] transition hover:bg-[#f4f4f8] hover:text-[#010170]"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(activity.id)}
            aria-label={`Remove saved activity ${activity.name}`}
            className="grid h-10 w-10 place-items-center rounded-full text-[#353572] transition hover:bg-[#fff1f1] hover:text-[#9a2d2d]"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {GROUP_TYPES.map((groupType) => {
          const Icon = groupType.icon;

          return (
            <div
              key={`${activity.id}-${groupType.key}`}
              className="rounded-xl border border-[#e4e3f0] bg-[#f8f8fc] p-4"
            >
              <div className="flex items-center gap-3 text-sm font-semibold text-[#010138]">
                <Icon className="h-4 w-4 text-[#4e4e5c]" />
                {groupType.label}
              </div>
              <p className="mt-5 text-sm text-[#5b5b68]">{groupType.range}</p>
              <div className="mt-8 flex items-end gap-2">
                <span className="pb-1 text-xl font-bold text-[#010138]">
                  $
                </span>
                <span className="text-xl font-bold text-[#010138]">
                  {formatPrice(activity.pricing[groupType.key])}
                </span>
                <span className="ml-auto pb-2 text-sm font-medium text-[#7b7b88]">
                  USD
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-6 flex justify-end">
        <span className="text-sm italic text-[#7b7b88]">
          Last edited {activity.savedAt}
        </span>
      </footer>
    </article>
  );
}

const TourCreationPage = () => {
  const [form, setForm] = useState(initialTourForm);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activities, setActivities] = useState([createEmptyActivity()]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [slotInput, setSlotInput] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [slots, setSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const slotCountLabel = getSlotCountLabel(slots.length);
  const derivedTourDuration = getDerivedTourDuration(slots);
  const todayDateInputValue = getTodayDateInputValue();

  const isPublishEnabled = useMemo(() => {
    return (
      Boolean(form.title.trim()) &&
      Boolean(form.destination.trim()) &&
      Boolean(form.description.trim()) &&
      hasAllPositivePrices(form.pricing) &&
      coverImage &&
      slots.length > 0 &&
      !uploadingCover &&
      !uploadingGallery
    );
  }, [
    coverImage,
    form.destination,
    form.description,
    form.pricing,
    form.title,
    slots.length,
    uploadingCover,
    uploadingGallery,
  ]);

  const handleUploadCover = async (file) => {
    if (!file) {
      return;
    }

    setUploadingCover(true);
    setErrorMessage("");

    try {
      const uploaded = await toursApi.uploadImage(file);
      setCoverImage(uploaded);
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadGallery = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploadingGallery(true);
    setErrorMessage("");

    try {
      const uploadedAssets = await Promise.all(
        Array.from(files).map((file) => toursApi.uploadImage(file)),
      );

      setGalleryImages((current) => [...current, ...uploadedAssets]);
    } catch (error) {
      setErrorMessage(error?.message ?? "Unable to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const addSlot = () => {
    if (!slotInput.date || !slotInput.startTime || !slotInput.endTime) {
      setErrorMessage(
        "Please add date, start time, and end time before adding a slot.",
      );
      return;
    }

    if (isDateBeforeToday(slotInput.date)) {
      setErrorMessage("Choose today or a future date for this slot.");
      return;
    }

    if (!isValidSlotRange(slotInput)) {
      setErrorMessage("Slot end time must be after the start time.");
      return;
    }

    const duplicateSlot = slots.some(
      (slot) =>
        slot.date === slotInput.date &&
        slot.startTime === slotInput.startTime &&
        slot.endTime === slotInput.endTime,
    );

    if (duplicateSlot) {
      setErrorMessage("This availability slot is already added.");
      return;
    }

    setSlots((current) => [
      ...current,
      { ...slotInput, id: createClientId() },
    ]);
    setSlotInput({ date: "", startTime: "", endTime: "" });
    setErrorMessage("");
  };

  const removeSlot = (slotId) => {
    setSlots((current) => current.filter((slot) => slot.id !== slotId));
  };

  const addActivity = () => {
    setActivities((current) => [...current, createEmptyActivity()]);
  };

  const removeSavedActivity = (activityId) => {
    setSavedActivities((current) =>
      current.filter((activity) => activity.id !== activityId),
    );
    setActivities((current) => {
      const remainingActivities = current.filter(
        (activity) => activity.savedActivityId !== activityId,
      );

      return remainingActivities.length > 0
        ? remainingActivities
        : [createEmptyActivity()];
    });
  };

  const editSavedActivity = (savedActivity) => {
    setActivities((current) => {
      const isAlreadyBeingEdited = current.some(
        (activity) => activity.savedActivityId === savedActivity.id,
      );

      if (isAlreadyBeingEdited) {
        return current;
      }

      const editDraft = {
        ...savedActivity,
        id: createClientId(),
        savedActivityId: savedActivity.id,
        pricing: { ...savedActivity.pricing },
      };
      const hasOnlyEmptyDraft =
        current.length === 1 && !hasActivityInput(current[0]);

      return hasOnlyEmptyDraft ? [editDraft] : [...current, editDraft];
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const discardActivity = (activityId) => {
    setActivities((current) => {
      if (current.length > 1) {
        return current.filter((activity) => activity.id !== activityId);
      }

      return current.map((activity) =>
        activity.id === activityId
          ? {
              ...createEmptyActivity(),
              id: activity.id,
            }
          : activity,
      );
    });
  };

  const updateActivityField = (activityId, field, value) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === activityId ? { ...activity, [field]: value } : activity,
      ),
    );
  };

  const updateActivityPrice = (activityId, groupType, value) => {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              pricing: {
                ...activity.pricing,
                [groupType]: normalizeNumberInput(value),
              },
            }
          : activity,
      ),
    );
  };

  const saveActivityDraft = (activity) => {
    setSuccessMessage("");

    if (!isActivityComplete(activity)) {
      setErrorMessage(
        "Complete the activity name, description, and all three prices before saving it.",
      );
      return;
    }

    const savedActivity = {
      ...activity,
      id: activity.savedActivityId ?? createClientId(),
      savedAt: "Just now",
    };
    delete savedActivity.savedActivityId;

    setSavedActivities((current) =>
      activity.savedActivityId
        ? current.map((saved) =>
            saved.id === activity.savedActivityId ? savedActivity : saved,
          )
        : [...current, savedActivity],
    );
    setActivities((current) => {
      if (current.length > 1) {
        return current.filter((draft) => draft.id !== activity.id);
      }

      return current.map((draft) =>
        draft.id === activity.id
          ? {
              ...createEmptyActivity(),
              id: draft.id,
            }
          : draft,
      );
    });
    setErrorMessage("");
    setSuccessMessage(
      activity.savedActivityId
        ? "Saved activity updated."
        : "Activity added to saved activities.",
    );
  };

  const handlePublish = async (event) => {
    event.preventDefault();

    if (!coverImage) {
      setErrorMessage("A cover image is required to publish the tour.");
      return;
    }

    if (!form.title.trim() || !form.destination.trim()) {
      setErrorMessage("Title and destination are required.");
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage("Add a short tour description before publishing.");
      return;
    }

    if (!hasAllPositivePrices(form.pricing)) {
      setErrorMessage(
        "Add private, small group, and large group prices before publishing.",
      );
      return;
    }

    if (slots.length === 0) {
      setErrorMessage("Add at least one available slot before publishing.");
      return;
    }

    const activityDraftWithInput = activities.find((activity) =>
      hasActivityInput(activity),
    );

    if (activityDraftWithInput) {
      if (!isActivityComplete(activityDraftWithInput)) {
        setErrorMessage(
          "Complete each activity name, description, and all three prices, or clear the row.",
        );
        return;
      }

      setErrorMessage(
        "Save the activity before publishing, or discard the draft row.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const activityPayload = savedActivities.map(toActivityPayload);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        destination: form.destination.trim(),
        duration: derivedTourDuration,
        pricing: toNumericPricing(form.pricing),
        coverImage,
        slots: slots.map((slot) => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };

      const meetingPoint = form.meetingPoint.trim();

      if (meetingPoint) {
        payload.meetingPoint = meetingPoint;
      }

      if (galleryImages.length > 0) {
        payload.galleryImages = galleryImages;
      }

      if (activityPayload.length > 0) {
        payload.activities = activityPayload;
      }

      await toursApi.createTour(payload);
      setSuccessMessage("Tour published successfully.");
      setForm(initialTourForm);
      setCoverImage(null);
      setGalleryImages([]);
      setActivities([createEmptyActivity()]);
      setSavedActivities([]);
      setSlotInput({ date: "", startTime: "", endTime: "" });
      setSlots([]);
    } catch (error) {
      setErrorMessage(
        error?.message ?? "Unable to publish the tour right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#010138]">
      <GuideNavbar verified />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 md:py-12">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#010170] to-[#010138] px-6 py-8 shadow-[0_14px_36px_rgba(1,1,112,0.2)] sm:px-8 sm:py-10">
          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full border border-white/10 bg-white/5" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EDC84C]">
              Guide studio
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Design a new experience
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#CCCCE2]">
              Turn a local story into a tour travelers will remember.
            </p>
          </div>
        </header>

        <form onSubmit={handlePublish} className="space-y-6">
          <section className="rounded-2xl border border-[#e8e7f2] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.07)] sm:p-6">
            <h2 className="text-2xl font-bold text-[#010138]">
              Tour basics
            </h2>
            <p className="mt-1 text-sm text-[#353572]">
              Tell tourists what makes this experience unforgettable.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Title"
                className="h-11 rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-4 text-sm text-[#010138] outline-none ring-[#010170] transition placeholder:text-[#8b89a8] focus:border-[#010170] focus:ring-2"
              />
              <select
                aria-label="Destination"
                value={form.destination}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-4 text-sm text-[#010138] outline-none ring-[#010170] transition placeholder:text-[#8b89a8] focus:border-[#010170] focus:ring-2"
              >
                <option value="">Select governorate</option>
                {EGYPT_GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              placeholder="Description"
              className="mt-4 w-full rounded-xl border border-[#d5d4ea] bg-[#FDFDFF] px-4 py-3 text-sm text-[#010138] outline-none ring-[#010170] transition placeholder:text-[#8b89a8] focus:border-[#010170] focus:ring-2"
            />

            <MeetingPointMap
              value={form.meetingPoint}
              onChange={(meetingPoint) =>
                setForm((current) => ({ ...current, meetingPoint }))
              }
            />
          </section>

          <section className="rounded-2xl border border-[#e8e7f2] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.07)] sm:p-6">
            <h2 className="text-2xl font-bold text-[#010138]">Media</h2>
            <p className="mt-1 text-sm text-[#353572]">
              Upload one cover image and optional gallery images.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block rounded-xl border border-dashed border-[#bbb9dc] bg-[#f8f8fc] p-5 transition hover:border-[#010170]">
                <span className="block text-sm font-semibold text-[#22205b]">
                  Cover image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleUploadCover(event.target.files?.[0])
                  }
                  className="mt-3 block text-sm"
                />
                <p className="mt-2 text-xs text-[#6b6992]">
                  {uploadingCover
                    ? "Uploading cover image..."
                    : coverImage
                      ? "Cover image uploaded"
                      : "PNG or JPG up to 10 MB"}
                </p>
              </label>

              <label className="block rounded-xl border border-dashed border-[#bbb9dc] bg-[#f8f8fc] p-5 transition hover:border-[#010170]">
                <span className="block text-sm font-semibold text-[#22205b]">
                  Gallery images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleUploadGallery(event.target.files)}
                  className="mt-3 block text-sm"
                />
                <p className="mt-2 text-xs text-[#6b6992]">
                  {uploadingGallery
                    ? "Uploading gallery images..."
                    : `${galleryImages.length} image(s) uploaded`}
                </p>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8e7f2] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.07)] sm:p-6">
            <h2 className="text-2xl font-bold text-[#010138]">
              Package pricing
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {GROUP_TYPES.map((groupType) => (
                <label
                  key={groupType.key}
                  className="rounded-xl border border-[#e4e3f0] bg-[#f8f8fc] p-4"
                >
                  <span className="block text-xs font-semibold text-[#6b6992]">
                    {groupType.label}
                  </span>
                  <span className="mt-1 block text-xs text-[#8b89a8]">
                    {groupType.range}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.pricing[groupType.key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pricing: {
                          ...current.pricing,
                          [groupType.key]: normalizeNumberInput(
                            event.target.value,
                          ),
                        },
                      }))
                    }
                    className="mt-2 w-full bg-transparent text-xl font-semibold outline-none"
                    placeholder="0"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8e7f2] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.07)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#EDC84C]">
                  Add-ons
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#010138]">
                  Optional activities
                </h2>
                <p className="mt-1 text-sm text-[#353572]">
                  Curate additional experiences travelers can add to their
                  journey.
                </p>
              </div>
              <button
                type="button"
                onClick={addActivity}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#010170] bg-white px-5 py-2 text-xs font-semibold text-[#010138] transition hover:bg-[#f4f4f8]"
              >
                <span>Add activity</span>
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {savedActivities.length > 0 ? (
              <div
                aria-label="Saved activities"
                className="mt-7 space-y-5"
              >
                {savedActivities.map((activity) => (
                  <SavedActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={editSavedActivity}
                    onRemove={removeSavedActivity}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-7 space-y-6">
              {activities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-2xl border border-[#dcdbea] bg-[#FDFDFF] p-5 shadow-[0_4px_18px_rgba(1,1,112,0.05)]"
                >
                  <div>
                    <input
                      value={activity.name}
                      onChange={(event) =>
                        updateActivityField(
                          activity.id,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Activity Name"
                      className="h-12 w-full rounded-xl border border-[#c9c8d9] bg-white px-4 text-sm font-medium text-[#010138] outline-none ring-[#010170] transition placeholder:text-[#6b6992] focus:border-[#010170] focus:ring-2"
                    />
                  </div>

                  <textarea
                    value={activity.description}
                    onChange={(event) =>
                      updateActivityField(
                        activity.id,
                        "description",
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder="Short Description"
                    className="mt-5 w-full resize-none rounded-xl border border-[#c9c8d9] bg-white px-4 py-3 text-sm text-[#010138] outline-none ring-[#010170] transition placeholder:text-[#6b6992] focus:border-[#010170] focus:ring-2"
                  />

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {GROUP_TYPES.map((groupType) => {
                      const Icon = groupType.icon;

                      return (
                        <label
                          key={`${activity.id}-${groupType.key}`}
                          className="rounded-xl border border-[#e4e3f0] bg-[#f8f8fc] p-4"
                        >
                          <span className="flex items-center gap-3 text-sm font-semibold text-[#010138]">
                            <Icon className="h-4 w-4 text-[#4e4e5c]" />
                            {groupType.label}
                          </span>
                          <span className="mt-5 block text-sm text-[#6d6d79]">
                            {groupType.range}
                          </span>
                          <span className="mt-8 flex items-end gap-2">
                            <span className="pb-1 text-xl font-bold text-[#AAAACF]">
                              $
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={activity.pricing[groupType.key]}
                              onChange={(event) =>
                                updateActivityPrice(
                                  activity.id,
                                  groupType.key,
                                  event.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-28 border-b border-[#c9c8d9] bg-transparent pb-1 text-xl font-bold text-[#010138] outline-none focus:border-[#010170]"
                            />
                            <span className="ml-auto pb-2 text-sm font-medium text-[#7b7b88]">
                              USD
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <footer className="mt-7 flex flex-wrap justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => discardActivity(activity.id)}
                      className="rounded-lg px-6 py-2.5 text-sm font-semibold text-[#353572] transition hover:bg-[#f4f4f8]"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => saveActivityDraft(activity)}
                      className="rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(1,1,112,0.22)] transition hover:opacity-90"
                    >
                      {activity.savedActivityId
                        ? "Update Activity"
                        : "Save Activity"}
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8e7f2] bg-white p-5 shadow-[0_6px_24px_rgba(1,1,112,0.07)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#010138]">
                  Availability
                </h2>
                <p className="mt-1 text-sm text-[#353572]">
                  Add one or more slots that tourists can book.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d8d7eb] bg-[#f7f7ff] px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#77759c]">
                  Time slots
                </p>
                <p
                  aria-label="Saved time slot count"
                  className="mt-1 text-lg font-bold text-[#010138]"
                >
                  {slotCountLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                type="date"
                min={todayDateInputValue}
                value={slotInput.date}
                onChange={(event) =>
                  setSlotInput((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-[#d5d4ea] bg-[#FDFDFF] px-3 py-2 text-sm text-[#010138] outline-none focus:border-[#010170]"
              />
              <input
                type="time"
                value={slotInput.startTime}
                onChange={(event) =>
                  setSlotInput((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-[#d5d4ea] bg-[#FDFDFF] px-3 py-2 text-sm text-[#010138] outline-none focus:border-[#010170]"
              />
              <input
                type="time"
                value={slotInput.endTime}
                onChange={(event) =>
                  setSlotInput((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-[#d5d4ea] bg-[#FDFDFF] px-3 py-2 text-sm text-[#010138] outline-none focus:border-[#010170]"
              />
              <button
                type="button"
                onClick={addSlot}
                className="rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(1,1,112,0.2)] transition hover:opacity-90"
              >
                Add slot
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d8d7eb] bg-[#fcfcff] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2c2b61]">
                      {slot.date} | {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="mt-1 text-xs text-[#706e96]">
                      {getSlotDurationLabel(slot)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="text-xs font-semibold text-[#8d2f2f]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {errorMessage ? (
            <p className="rounded-xl border border-[#efc2c2] bg-[#fff2f2] px-4 py-3 text-sm text-[#a12121]">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl border border-[#bedfb8] bg-[#eefce9] px-4 py-3 text-sm text-[#1f6a21]">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isPublishEnabled || isSubmitting}
              className="rounded-lg bg-gradient-to-r from-[#010170] to-[#5656A0] px-7 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(1,1,112,0.28)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish tour"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default TourCreationPage;
