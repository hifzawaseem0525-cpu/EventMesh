import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    price: 0,
    image: "",
    description: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load the organizer's events, including draft events.
  useEffect(() => {
    let cancelled = false;

    async function fetchEvent() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please log in as an organizer to edit this event.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/events/my-events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            data.detail ||
              "Your session is invalid or you do not have organizer access. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(data.detail || "Could not load your events.");
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected events response.");
        }

        const event = data.find(
          (item) => String(item.id) === String(id)
        );

        if (!event) {
          throw new Error(
            "Event not found in your organizer account. Check that you are logged in as the event owner."
          );
        }

        if (!cancelled) {
          setFormData({
            title: event.title || "",
            category: event.category || "",
            date: toDateTimeLocal(event.date),
            location: event.location || "",
            price: event.price ?? 0,
            image: event.image || "",
            description: event.description || "",
            status: String(event.status || "draft").toLowerCase(),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load event.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  // Save changes to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!formData.date) {
      setError("Please choose the event date and time.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid ticket price.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location: formData.location.trim(),
          date: formData.date,
          price,
          image: formData.image.trim() || null,
          status: formData.status,
        }),
      });

      const data = await readResponse(response);

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          data.detail ||
            "You are not authorized to update this event. Check your organizer login."
        );
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update event.");
      }

      setSaved(true);

      window.setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setError(err.message || "Failed to save your changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-slate-400">Loading event...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-block text-sm font-semibold text-purple-400 hover:text-purple-300"
        >
          ← Back to Dashboard
        </Link>

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

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Event title */}
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
                {[
                  "Technology",
                  "Music",
                  "Sports",
                  "Workshop",
                  "Cultural",
                  "Business",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and time */}
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Event Date &amp; Time
              </label>

              <input
                id="date"
                name="date"
                type="datetime-local"
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

            {/* Ticket price */}
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
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                rows={6}
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || saved}
              className={`rounded-xl px-6 py-3 font-bold text-white transition ${
                saved
                  ? "cursor-not-allowed bg-green-600"
                  : saving
                    ? "cursor-not-allowed bg-purple-800"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              }`}
            >
              {saved
                ? "Changes Saved ✓"
                : saving
                  ? "Saving..."
                  : "Save Changes"}
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