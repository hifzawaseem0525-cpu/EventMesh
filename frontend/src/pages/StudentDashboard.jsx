import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";

const API_URL = "http://127.0.0.1:8000";

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load events");
        }

        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        events.map((event) => event.category).filter(Boolean)
      ),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        (event.title || "").toLowerCase().includes(search) ||
        (event.category || "").toLowerCase().includes(search) ||
        (event.location || "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
            Student Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Discover your next event
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Explore events, find something interesting, and book your tickets.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Upcoming Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              My Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              My Tickets
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

        </section>

        {/* Search */}
        <section className="mb-6">
          <label
            htmlFor="event-search"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Search events
          </label>

          <input
            id="event-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event, category, or location..."
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
          />
        </section>

        {/* Categories */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}

          </div>
        </section>

        {/* Events */}
        <section id="events">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Available Events
            </h2>

            {!loading && !error && (
              <p className="text-sm text-slate-400">
                {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
              </p>
            )}

          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-slate-400">
                Loading events...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-10 text-center">
              <h3 className="text-xl font-bold text-red-300">
                Unable to load events
              </h3>

              <p className="mt-2 text-red-200/70">
                {error}
              </p>
            </div>
          )}

          {/* No events */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">

              <h3 className="text-xl font-bold">
                No events found
              </h3>

              <p className="mt-2 text-slate-400">
                Try a different search term or category.
              </p>

            </div>
          )}

          {/* Events */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default StudentDashboard;