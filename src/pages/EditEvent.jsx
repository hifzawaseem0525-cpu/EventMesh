import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import events from "../data/events";

function safeParse(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const createdEvents = safeParse("eventmeshCreatedEvents");
  const editedEvents = safeParse("eventmeshEditedEvents");

  const allEvents = [...events, ...createdEvents];

  const originalEvent = allEvents.find(
    (event) => String(event.id) === String(id)
  );

  const savedEdit = editedEvents.find(
    (event) => String(event.id) === String(id)
  );

  const event = savedEdit || originalEvent;
  const isCreatedEvent = createdEvents.some(
    (e) => String(e.id) === String(id)
  );

  const [formData, setFormData] = useState(
    event
      ? {
          title: event.title || "",
          category: event.category || "",
          date: event.date || "",
          displayDate: event.displayDate || "",
          location: event.location || "",
          price: event.price || 0,
          image: event.image || "",
          description: event.description || "",
        }
      : null
  );

  const [saved, setSaved] = useState(false);

  if (!event || !formData) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">Event not found</h1>

          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      // keep displayDate in sync whenever the raw date changes
      ...(name === "date" ? { displayDate: formatDisplayDate(value) } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedEvent = {
      ...event,
      ...formData,
      price: Number(formData.price) || 0,
      displayDate: formatDisplayDate(formData.date),
    };

    // Always update the editedEvents overlay — this is what every page
    // that lists events should read from (merged over `events` +
    // `eventmeshCreatedEvents`) so an edit to ANY event, mock or
    // user-created, actually shows up app-wide.
    const existingEditedEvents = safeParse("eventmeshEditedEvents");

    const updatedEditedEvents = [
      ...existingEditedEvents.filter(
        (item) => String(item.id) !== String(event.id)
      ),
      updatedEvent,
    ];

    localStorage.setItem(
      "eventmeshEditedEvents",
      JSON.stringify(updatedEditedEvents)
    );

    // If this event was itself user-created, also update its entry in
    // eventmeshCreatedEvents so the two stores don't drift apart.
    if (isCreatedEvent) {
      const existingCreatedEvents = safeParse("eventmeshCreatedEvents");

      const updatedCreatedEvents = existingCreatedEvents.map((item) =>
        String(item.id) === String(event.id) ? updatedEvent : item
      );

      localStorage.setItem(
        "eventmeshCreatedEvents",
        JSON.stringify(updatedCreatedEvents)
      );
    }

    setSaved(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          to="/dashboard"
          className="mb-6 inline-block text-sm font-semibold text-purple-400 hover:text-purple-300"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
            Organizer Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">
            Edit Event
          </h1>

          <p className="mt-3 text-slate-400">
            Update your event information and save your changes.
          </p>
        </section>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">

            {/* Title */}
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
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
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
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              >
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="Cultural">Cultural</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
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
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
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
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
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
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
            </div>

            {/* Image */}
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
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

            <Link
              to="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saved}
              className={`rounded-xl px-6 py-3 font-bold text-white transition ${
                saved
                  ? "cursor-not-allowed bg-green-600"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              }`}
            >
              {saved ? "Changes Saved ✓" : "Save Changes"}
            </button>

          </div>

          {/* Success message */}
          {saved && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-center text-green-300"
            >
              Event updated successfully! Returning to dashboard...
            </div>
          )}

        </form>
      </div>
    </main>
  );
}

export default EditEvent;
