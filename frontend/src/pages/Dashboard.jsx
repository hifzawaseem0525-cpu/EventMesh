
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const STATUS_OPTIONS = ["published", "draft", "completed", "cancelled"];

const STATUS_STYLES = {
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  draft: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  completed: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  cancelled: "bg-red-500/15 text-red-300 border-red-400/20",
};

function getToken() {
  return localStorage.getItem("access_token");
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not set";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function isUpcoming(event) {
  if (!event.date) return false;

  const eventDate = new Date(event.date);

  return (
    !Number.isNaN(eventDate.getTime()) &&
    eventDate >= new Date() &&
    event.status === "published"
  );
}

function getEventImage(event) {
  return event.image || event.image_url || event.banner_image || "";
}

function getEventPrice(event) {
  return event.price ?? event.ticket_price ?? 0;
}

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const token = getToken();

    if (!token) {
      setError("Please log in again to view your events.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events/my-events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load your events.")
        );
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const stats = useMemo(() => {
    const published = events.filter(
      (event) => event.status === "published"
    ).length;

    const drafts = events.filter(
      (event) => event.status === "draft"
    ).length;

    const upcoming = events.filter(isUpcoming).length;

    return {
      total: events.length,
      published,
      drafts,
      upcoming,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;

    return events.filter((event) => event.status === filter);
  }, [events, filter]);

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 4);
  }, [events]);

  async function handleStatusChange(event, newStatus) {
    if (event.status === newStatus) return;

    const token = getToken();

    if (!token) {
      setError("Please log in again to update your events.");
      return;
    }

    setUpdatingId(event.id);
    setError("");
    setNotice("");

    const payload = {
      title: event.title ?? "",
      description: event.description ?? "",
      category: event.category ?? "",
      location: event.location ?? "",
      date: event.date ?? "",
      price: Number(getEventPrice(event)),
      image: event.image ?? event.image_url ?? "",
      status: newStatus,
    };

    try {
      const response = await fetch(`${API_URL}/events/${event.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to update the event.")
        );
      }

      setEvents((previousEvents) =>
        previousEvents.map((item) =>
          item.id === event.id
            ? { ...item, ...data, status: newStatus }
            : item
        )
      );

      setNotice("Event status updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update the event.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(event) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Please log in again to delete your events.");
      return;
    }

    setDeletingId(event.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/events/${event.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          getErrorMessage(data, "Unable to delete the event.")
        );
      }

      setEvents((previousEvents) =>
        previousEvents.filter((item) => item.id !== event.id)
      );

      setNotice("Event deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete the event.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
              EventMesh Organizer
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Manage your events and keep everything organized.
            </p>
          </div>

          {/* Dashboard actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/organizer/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-200 transition hover:bg-purple-500/20"
            >
              <span className="text-lg">🎫</span>
              Scan Tickets
            </Link>

            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold shadow-lg shadow-purple-950/30 transition hover:bg-purple-500"
            >
              <span className="text-lg">＋</span>
              Create Event
            </Link>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-purple-300/10 bg-gradient-to-r from-purple-700/30 via-indigo-700/20 to-slate-800/40 p-6 shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-purple-200">
                Welcome back!
              </p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Your events, all in one place.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Check your event status, update your listings, and create your
                next experience.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/[0.06] text-4xl md:self-center">
              🎉
            </div>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 sm:flex-row sm:items-center"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={loadEvents}
              className="shrink-0 font-semibold text-red-100 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {notice && !error && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {notice}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="📅"
            label="Total Events"
            value={loading ? "—" : stats.total}
            description="Events in your account"
            accent="purple"
          />

          <StatCard
            icon="🌟"
            label="Published Events"
            value={loading ? "—" : stats.published}
            description="Currently published"
            accent="emerald"
          />

          <StatCard
            icon="⏳"
            label="Upcoming Events"
            value={loading ? "—" : stats.upcoming}
            description="Published and upcoming"
            accent="blue"
          />

          <StatCard
            icon="📝"
            label="Draft Events"
            value={loading ? "—" : stats.drafts}
            description="Not yet published"
            accent="amber"
          />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">

          {/* Events List */}
          <section className="min-w-0 xl:col-span-2">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                  Your Workspace
                </p>

                <h2 className="mt-1 text-2xl font-bold">My Events</h2>

                <p className="mt-1 text-sm text-slate-400">
                  View and manage your event listings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", ...STATUS_OPTIONS].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
                      filter === status
                        ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-purple-300/20 border-t-purple-400" />

                <p className="font-medium text-slate-200">
                  Loading your events...
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Connecting to the server.
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
                <div className="mb-4 text-5xl">🎟️</div>

                <h3 className="text-xl font-bold">
                  {events.length === 0 ? "No events yet" : "No events found"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {events.length === 0
                    ? "Create your first event to get started. Your events will appear here once they have been saved."
                    : `There are no events with the "${filter}" status.`}
                </p>

                {events.length === 0 && (
                  <Link
                    to="/create-event"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
                  >
                    <span>＋</span>
                    Create Your First Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    updating={updatingId === event.id}
                    deleting={deletingId === event.id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {!loading && events.length > 0 && (
              <p className="mt-4 text-xs text-slate-500">
                Showing {filteredEvents.length} of {events.length} events.
              </p>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Quick Actions */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>

                <div>
                  <p className="text-sm font-semibold text-purple-300">
                    QUICK ACTIONS
                  </p>

                  <h2 className="text-xl font-bold">Get things done</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  to="/organizer/scanner"
                  className="block rounded-xl border border-purple-400/20 bg-purple-500/10 p-4 text-center text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
                >
                  <span className="block text-xl">🎫</span>
                  <span className="mt-2 block">Scan Tickets</span>
                </Link>

                <Link
                  to="/create-event"
                  className="block rounded-xl bg-purple-600/80 p-4 text-center text-sm font-semibold transition hover:bg-purple-500"
                >
                  <span className="block text-xl">➕</span>
                  <span className="mt-2 block">Create Event</span>
                </Link>
              </div>
            </section>

            {/* Recent Events */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕒</span>

                  <div>
                    <p className="text-sm font-semibold text-purple-300">
                      YOUR ACTIVITY
                    </p>

                    <h2 className="text-xl font-bold">Recent Events</h2>
                  </div>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                  {recentEvents.length}
                </span>
              </div>

              {loading ? (
                <p className="text-sm text-slate-400">
                  Loading recent events...
                </p>
              ) : recentEvents.length === 0 ? (
                <p className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-400">
                  Your recent events will appear here.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-300/10 bg-purple-500/10">
                        📌
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {event.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(event.date)}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${
                            STATUS_STYLES[event.status] ||
                            "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {event.status || "unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>

        {/* Bottom CTA */}
        <section className="mt-8 rounded-3xl border border-purple-300/10 bg-gradient-to-r from-purple-700/20 to-indigo-700/20 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-purple-300">
                READY FOR WHAT'S NEXT?
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Bring your next event to life.
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Create an event and share your next experience.
              </p>
            </div>

            <Link
              to="/create-event"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
            >
              Create Event
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-white/10 py-5 text-center text-xs text-slate-500">
          EventMesh · Organizer Dashboard
        </footer>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description, accent }) {
  const accentStyles = {
    purple: "bg-purple-500/10 text-purple-300 border-purple-400/10",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-400/10",
    blue: "bg-blue-500/10 text-blue-300 border-blue-400/10",
    amber: "bg-amber-500/10 text-amber-300 border-amber-400/10",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg transition hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl ${
            accentStyles[accent] || accentStyles.purple
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function EventCard({
  event,
  updating,
  deleting,
  onStatusChange,
  onDelete,
}) {
  const image = getEventImage(event);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg transition hover:border-purple-300/20 hover:bg-white/[0.055]">
      <div className="flex flex-col sm:flex-row">

        {/* Event Image */}
        <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-purple-900/70 to-indigo-900/70 sm:h-auto sm:min-h-[230px] sm:w-48">
          {image ? (
            <img
              src={image}
              alt={event.title || "Event"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-5xl">
              🎉
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize backdrop-blur-md ${
                STATUS_STYLES[event.status] ||
                "border-white/10 bg-slate-900/70 text-slate-200"
              }`}
            >
              {event.status || "unknown"}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                {event.category || "Event"}
              </p>

              <h3 className="mt-2 break-words text-xl font-bold">
                {event.title || "Untitled Event"}
              </h3>

              <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                <span>📍</span>
                <span>{event.location || "Location not set"}</span>
              </p>

              <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                <span>📅</span>
                <span>{formatDate(event.date)}</span>
              </p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-xs text-slate-500">Ticket price</p>

              <p className="mt-1 text-xl font-bold text-emerald-300">
                {formatCurrency(getEventPrice(event))}
              </p>
            </div>
          </div>

          {event.description && (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
              {event.description}
            </p>
          )}

          {/* Booking and Revenue placeholders */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-black/10 p-3">
              <p className="text-xs text-slate-500">Bookings</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">—</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/10 p-3">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">—</p>
            </div>
          </div>

          {/* Event Actions */}
          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/edit-event/${event.id}`}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                ✏️ Edit Event
              </Link>

              <Link
                to={`/manage-tickets/${event.id}`}
                className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20"
              >
                🎟️ Manage Tickets
              </Link>

              <button
                type="button"
                onClick={() => onDelete(event)}
                disabled={deleting || updating}
                className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "🗑 Delete"}
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400">
              {updating ? "Updating..." : "Status"}

              <select
                value={event.status || "draft"}
                onChange={(e) =>
                  onStatusChange(event, e.target.value)
                }
                disabled={updating || deleting}
                className="max-w-[145px] rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold capitalize text-slate-200 outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-slate-900 text-white"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
