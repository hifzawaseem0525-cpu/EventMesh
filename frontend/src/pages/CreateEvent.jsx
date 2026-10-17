
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const INITIAL_FORM = {
  title: "",
  category: "",
  date: "",
  location: "",
  price: "",
  image: "",
  description: "",
};

const categories = [
  "Technology",
  "Music",
  "Sports",
  "Workshop",
  "Cultural",
  "Business",
  "Other",
];

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdEvent, setCreatedEvent] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError(
        "Your login session was not found. Please log in again as an organizer."
      );
      return;
    }

    if (!formData.date) {
      setError("Please select an event date.");
      return;
    }

    // The backend expects a datetime, while the form provides a date.
    // Use 10 AM to avoid timezone date shifts.
    const eventDate = `${formData.date}T10:00:00`;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      location: formData.location.trim(),
      date: eventDate,
      price: Number(formData.price),
      image: formData.image.trim() || null,
      status: "draft",
    };

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/events/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : "Only an authorized organizer can create events."
          );
        }

        throw new Error(
          getErrorMessage(data, "The event could not be created.")
        );
      }

      // Only show success after the backend confirms the event was saved.
      setCreatedEvent(data);
      setCreated(true);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setCreated(false);
    setCreatedEvent(null);
    setError("");
  };

  if (created) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <section className="w-full rounded-3xl border border-green-400/20 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl text-green-300">
              ✓
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-300">
              EventMesh
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Event Created Successfully!
            </h1>

            <p className="mt-3 text-slate-400">
              Your event has been saved to the backend as a draft.
              You can manage its status from the Organizer Dashboard.
            </p>

            {createdEvent && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Event ID: {createdEvent.id}
                </p>

                <h2 className="mt-2 break-words text-lg font-bold">
                  {createdEvent.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {createdEvent.category} · {createdEvent.location}
                </p>

                <span className="mt-3 inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold capitalize text-amber-300">
                  {createdEvent.status}
                </span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition hover:from-purple-500 hover:to-indigo-500"
              >
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                Create Another
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center text-sm font-semibold text-purple-300 transition hover:text-purple-200"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
            Organizer Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Create New Event
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Add the details of your event and save it as a draft.
          </p>
        </section>

        {/* Backend error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-sm md:p-8"
        >
          {/* Event Information */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Event Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide the basic information about your event.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Event Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Event Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Event Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Seminar Hall"
                  maxLength={255}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Ticket Price (₹)
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0 for free event"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Enter 0 if the event is free.
                </p>
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Event Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/event-image.jpg"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Optional. Leave empty to use the default placeholder.
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Event Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={6}
                  required
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-white/10" />

          {/* Event Preview */}
          <section className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.04] p-5">
            <h2 className="text-lg font-bold">
              Event Preview
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
              <p className="break-words">
                <span className="font-semibold text-slate-300">
                  Title:
                </span>{" "}
                {formData.title || "Not provided"}
              </p>

              <p>
                <span className="font-semibold text-slate-300">
                  Category:
                </span>{" "}
                {formData.category || "Not selected"}
              </p>

              <p>
                <span className="font-semibold text-slate-300">
                  Date:
                </span>{" "}
                {formData.date || "Not selected"}
              </p>

              <p className="break-words">
                <span className="font-semibold text-slate-300">
                  Location:
                </span>{" "}
                {formData.location || "Not provided"}
              </p>

              <p>
                <span className="font-semibold text-slate-300">
                  Price:
                </span>{" "}
                {formData.price !== ""
                  ? `₹${formData.price}`
                  : "Not provided"}
              </p>

              <p>
                <span className="font-semibold text-slate-300">
                  Status:
                </span>{" "}
                Draft
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateEvent;
