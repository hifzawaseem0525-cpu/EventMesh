import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    price: "",
    image: "",
    description: "",
  });

  const [created, setCreated] = useState(false);

  const categories = [
    "Technology",
    "Music",
    "Sports",
    "Workshop",
    "Cultural",
    "Business",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingCreatedEvents =
      JSON.parse(localStorage.getItem("eventmeshCreatedEvents")) || [];

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      displayDate: new Date(formData.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      date: formData.date,
      location: formData.location,
      price: Number(formData.price) || 0,
      image: formData.image,
      description: formData.description,
      status: "Draft",
      bookings: 0,
    };

    localStorage.setItem(
      "eventmeshCreatedEvents",
      JSON.stringify([...existingCreatedEvents, newEvent])
    );

    setCreated(true);
  };

  if (created) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <section className="w-full rounded-3xl border border-green-400/20 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl">
              ✓
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-300">
              EventMesh
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Event Created Successfully!
            </h1>

            <p className="mt-3 text-slate-400">
              Your event has been saved as a draft. You can manage its status
              from the Organizer Dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/dashboard"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition hover:from-purple-500 hover:to-indigo-500"
              >
                Go to Dashboard
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCreated(false);
                  setFormData({
                    title: "",
                    category: "",
                    date: "",
                    location: "",
                    price: "",
                    image: "",
                    description: "",
                  });
                }}
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
                  rows="6"
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
              <p>
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

              <p>
                <span className="font-semibold text-slate-300">
                  Location:
                </span>{" "}
                {formData.location || "Not provided"}
              </p>

              <p>
                <span className="font-semibold text-slate-300">
                  Price:
                </span>{" "}
                {formData.price
                  ? `₹${formData.price}`
                  : "Free / Not provided"}
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
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Create Event
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default CreateEvent;