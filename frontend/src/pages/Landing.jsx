import { useState } from "react";
import EventCard from "../components/EventCard";
import events from "../data/Events";

function Landing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(events.map((event) => event.category)),
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title} ${event.category} ${event.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Hero */}
        <section className="py-12 text-center md:py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">
            Discover • Connect • Experience
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Discover Amazing
            <span className="block text-purple-400">
              Events Near You
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Find concerts, workshops, conferences, cultural festivals,
            networking events and more—all in one place.
          </p>
        </section>

        {/* Filters */}
        <section className="mx-auto mb-12 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">

            {/* Search */}
            <div>
              <label
                htmlFor="event-search"
                className="mb-2 block text-sm font-semibold text-purple-200"
              >
                Search events
              </label>

              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg"
                  aria-hidden="true"
                >
                  🔎
                </span>

                <input
                  id="event-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by event, category or location..."
                  className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-slate-900 shadow-xl outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-semibold text-purple-200"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-slate-900 shadow-xl outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All"
                      ? "All Categories"
                      : category}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* Events */}
        <section className="pb-16">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                Explore
              </p>

              <h2 className="mt-1 text-3xl font-bold text-white md:text-4xl">
                Upcoming Events
              </h2>
            </div>

            <p className="text-sm text-slate-400">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div
              role="status"
              className="rounded-3xl border border-white/10 bg-white/10 px-6 py-16 text-center backdrop-blur-sm"
            >
              <p className="text-4xl">🔍</p>

              <h3 className="mt-4 text-2xl font-bold text-white">
                No events found
              </h3>

              <p className="mt-2 text-slate-300">
                Try changing your search or category.
              </p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default Landing;