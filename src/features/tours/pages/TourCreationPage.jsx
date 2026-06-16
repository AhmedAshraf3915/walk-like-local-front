import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toursApi } from "@/features/tours/api/toursApi";

const GROUP_TYPES = [
  { key: "PRIVATE", label: "Private" },
  { key: "SMALL_GROUP", label: "Small Group" },
  { key: "LARGE_GROUP", label: "Large Group" },
];

const emptyPricing = {
  PRIVATE: "",
  SMALL_GROUP: "",
  LARGE_GROUP: "",
};

const createEmptyActivity = () => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  removable: true,
  pricing: { ...emptyPricing },
});

const toNumericPricing = (pricing) =>
  Object.fromEntries(
    Object.entries(pricing).map(([key, value]) => [key, Number(value || 0)]),
  );

const TourCreationPage = () => {
  const [form, setForm] = useState({
    title: "",
    destination: "",
    meetingPoint: "",
    durationHours: "",
    description: "",
    pricing: { ...emptyPricing },
  });
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activities, setActivities] = useState([createEmptyActivity()]);
  const [slotInput, setSlotInput] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [slots, setSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isPublishEnabled = useMemo(() => {
    return (
      Boolean(form.title.trim()) &&
      Boolean(form.destination.trim()) &&
      Boolean(form.durationHours) &&
      coverImage &&
      slots.length > 0
    );
  }, [
    coverImage,
    form.destination,
    form.durationHours,
    form.title,
    slots.length,
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

    setSlots((current) => [
      ...current,
      { ...slotInput, id: crypto.randomUUID() },
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

  const removeActivity = (activityId) => {
    setActivities((current) =>
      current.filter((activity) => activity.id !== activityId),
    );
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
                [groupType]: value,
              },
            }
          : activity,
      ),
    );
  };

  const handlePublish = async (event) => {
    event.preventDefault();

    if (!coverImage) {
      setErrorMessage("A cover image is required to publish the tour.");
      return;
    }

    if (slots.length === 0) {
      setErrorMessage("Add at least one available slot before publishing.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        destination: form.destination.trim(),
        meetingPoint: form.meetingPoint.trim() || undefined,
        duration: `${String(form.durationHours).trim()} hours`,
        pricing: toNumericPricing(form.pricing),
        coverImage,
        galleryImages,
        activities: activities
          .filter((activity) => activity.name.trim())
          .map((activity) => ({
            name: activity.name.trim(),
            description: activity.description.trim(),
            pricing: toNumericPricing(activity.pricing),
            removable: Boolean(activity.removable),
          })),
        slots: slots.map((slot) => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };

      await toursApi.createTour(payload);
      setSuccessMessage("Tour published successfully.");
    } catch (error) {
      setErrorMessage(
        error?.message ?? "Unable to publish the tour right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2fa] text-[#1a194f]">
      <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6">
        <header className="rounded-3xl border border-[#dddced] bg-white p-6 shadow-[0_20px_50px_rgba(32,30,88,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a78a3]">
            Tour Creation
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#12104b] sm:text-4xl">
              Design a new experience
            </h1>
            <Link
              to="/guide/profile"
              className="rounded-full border border-[#cfcee6] bg-white px-5 py-2 text-sm font-semibold text-[#323166]"
            >
              Back To Profile
            </Link>
          </div>
        </header>

        <form onSubmit={handlePublish} className="space-y-6">
          <section className="rounded-3xl border border-[#dddced] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#161453]">
              Tour basics
            </h2>
            <p className="mt-1 text-sm text-[#65638a]">
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
                className="rounded-xl border border-[#d5d4ea] px-3 py-2.5 outline-none ring-[#302d96] focus:ring-2"
              />
              <input
                value={form.destination}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
                placeholder="Destination"
                className="rounded-xl border border-[#d5d4ea] px-3 py-2.5 outline-none ring-[#302d96] focus:ring-2"
              />
              <input
                value={form.meetingPoint}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    meetingPoint: event.target.value,
                  }))
                }
                placeholder="Meeting point"
                className="rounded-xl border border-[#d5d4ea] px-3 py-2.5 outline-none ring-[#302d96] focus:ring-2"
              />
              <input
                type="number"
                min="1"
                value={form.durationHours}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationHours: event.target.value,
                  }))
                }
                placeholder="Duration (hours)"
                className="rounded-xl border border-[#d5d4ea] px-3 py-2.5 outline-none ring-[#302d96] focus:ring-2"
              />
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
              className="mt-4 w-full rounded-xl border border-[#d5d4ea] px-3 py-2.5 outline-none ring-[#302d96] focus:ring-2"
            />
          </section>

          <section className="rounded-3xl border border-[#dddced] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#161453]">Media</h2>
            <p className="mt-1 text-sm text-[#65638a]">
              Upload one cover image and optional gallery images.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block rounded-2xl border border-dashed border-[#bbb9dc] bg-[#fafaff] p-5">
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

              <label className="block rounded-2xl border border-dashed border-[#bbb9dc] bg-[#fafaff] p-5">
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

          <section className="rounded-3xl border border-[#dddced] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#161453]">
              Package pricing
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {GROUP_TYPES.map((groupType) => (
                <label
                  key={groupType.key}
                  className="rounded-xl border border-[#d5d4ea] bg-[#fbfbff] p-3"
                >
                  <span className="text-xs font-semibold text-[#6b6992]">
                    {groupType.label}
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
                          [groupType.key]: event.target.value,
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

          <section className="rounded-3xl border border-[#dddced] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#161453]">
                Optional activities
              </h2>
              <button
                type="button"
                onClick={addActivity}
                className="rounded-full border border-[#c5c4e1] bg-white px-4 py-2 text-sm font-semibold text-[#343365]"
              >
                Add activity
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-[#d5d4ea] bg-[#fbfbff] p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      value={activity.name}
                      onChange={(event) =>
                        updateActivityField(
                          activity.id,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Activity name"
                      className="rounded-lg border border-[#d5d4ea] bg-white px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(activity.id)}
                      className="rounded-lg border border-[#d7d6eb] px-3 py-2 text-sm text-[#55537f]"
                    >
                      Remove
                    </button>
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
                    rows={2}
                    placeholder="Short description"
                    className="mt-3 w-full rounded-lg border border-[#d5d4ea] bg-white px-3 py-2"
                  />

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {GROUP_TYPES.map((groupType) => (
                      <input
                        key={`${activity.id}-${groupType.key}`}
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
                        placeholder={`${groupType.label} price`}
                        className="rounded-lg border border-[#d5d4ea] bg-white px-3 py-2"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#dddced] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#161453]">
              Availability
            </h2>
            <p className="mt-1 text-sm text-[#65638a]">
              Add one or more slots that tourists can book.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                type="date"
                value={slotInput.date}
                onChange={(event) =>
                  setSlotInput((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="rounded-lg border border-[#d5d4ea] px-3 py-2"
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
                className="rounded-lg border border-[#d5d4ea] px-3 py-2"
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
                className="rounded-lg border border-[#d5d4ea] px-3 py-2"
              />
              <button
                type="button"
                onClick={addSlot}
                className="rounded-lg bg-[#1f1c83] px-4 py-2 text-sm font-semibold text-white"
              >
                Add slot
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border border-[#d8d7eb] bg-[#fcfcff] px-4 py-3"
                >
                  <p className="text-sm text-[#2c2b61]">
                    {slot.date} | {slot.startTime} - {slot.endTime}
                  </p>
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
              className="rounded-full bg-[#1b197d] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(27,25,125,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourCreationPage;
