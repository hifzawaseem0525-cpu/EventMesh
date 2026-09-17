import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import events from "../data/events";

function Dashboard() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  // Get events created from Create Event page
const createdEvents =
  JSON.parse(localStorage.getItem("eventmeshCreatedEvents")) || [];

// Get events edited from Edit Event page
const editedEvents =
  JSON.parse(localStorage.getItem("eventmeshEditedEvents")) || [];

// Combine default events + created events
const allEvents = [...events, ...createdEvents].map((event) => {
  const editedEvent = editedEvents.find(
    (edited) => String(edited.id) === String(event.id)
  );

  return editedEvent ? { ...event, ...editedEvent } : event;
  });
  const [dashboardEvents, setDashboardEvents] = useState(
    allEvents.map((event, index) => ({
      ...event,

      status:
        event.status ||
        (index === 0
          ? "Published"
          : index === 1
          ? "Published"
          : index === 2
          ? "Completed"
          : index === 3
          ? "Draft"
          : "Published"),

      bookings:
        event.bookings ??
        [24, 18, 32, 12, 27, 15][index] ??
        10,
    }))
  );

  const statusOptions = [
    "All",
    "Published",
    "Draft",
    "Completed",
    "Cancelled",
  ];

  // Filter events
  const filteredEvents = dashboardEvents.filter(
    (event) =>
      selectedStatus === "All" ||
      event.status === selectedStatus
  );

  // Total bookings
  const totalBookings = dashboardEvents.reduce(
    (total, event) => total + event.bookings,
    0
  );

  // Total revenue
  const totalRevenue = dashboardEvents.reduce(
    (total, event) =>
      total + (event.price || 0) * event.bookings,
    0
  );

  // Published events
  const publishedEvents = dashboardEvents.filter(
    (event) => event.status === "Published"
  ).length;

  // Upcoming events
  const upcomingEvents = dashboardEvents.filter(
    (event) => event.status === "Published"
  ).length;

  const changeStatus = (eventId, newStatus) => {
  // Update dashboard state
  setDashboardEvents((currentEvents) =>
    currentEvents.map((event) =>
      event.id === eventId
        ? {
            ...event,
            status: newStatus,
          }
        : event
    )
  );

  // Save status for created events
  const createdEvents =
    JSON.parse(localStorage.getItem("eventmeshCreatedEvents")) || [];

  const updatedCreatedEvents = createdEvents.map((event) =>
    event.id === eventId
      ? {
          ...event,
          status: newStatus,
        }
      : event
  );

  localStorage.setItem(
    "eventmeshCreatedEvents",
    JSON.stringify(updatedCreatedEvents)
  );

  // Save status for edited/original events
  const editedEvents =
    JSON.parse(localStorage.getItem("eventmeshEditedEvents")) || [];

  const existingEditIndex = editedEvents.findIndex(
    (event) => String(event.id) === String(eventId)
  );

  if (existingEditIndex !== -1) {
    editedEvents[existingEditIndex] = {
      ...editedEvents[existingEditIndex],
      status: newStatus,
    };
  } else {
    const currentEvent = dashboardEvents.find(
      (event) => event.id === eventId
    );

    if (currentEvent) {
      editedEvents.push({
        ...currentEvent,
        status: newStatus,
      });
    }
  }

  localStorage.setItem(
    "eventmeshEditedEvents",
    JSON.stringify(editedEvents)
  );
};
  // Delete event
  const deleteEvent = (eventId) => {
    const event = dashboardEvents.find(
      (item) => item.id === eventId
    );

    if (!event) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    // Remove from dashboard
    setDashboardEvents((currentEvents) =>
      currentEvents.filter(
        (item) => item.id !== eventId
      )
    );

    // Remove from created events in localStorage
    const savedCreatedEvents =
      JSON.parse(
        localStorage.getItem("eventmeshCreatedEvents")
      ) || [];

    const updatedCreatedEvents =
      savedCreatedEvents.filter(
        (item) => item.id !== eventId
      );

    localStorage.setItem(
      "eventmeshCreatedEvents",
      JSON.stringify(updatedCreatedEvents)
    );
  };

  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: "🎟️",
      change: "+12%",
      description: "from last month",
      iconStyle: "from-purple-500 to-indigo-500",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: "💰",
      change: "+18%",
      description: "from last month",
      iconStyle: "from-pink-500 to-rose-500",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents,
      icon: "📅",
      change: "+2",
      description: "this month",
      iconStyle: "from-blue-500 to-cyan-500",
    },
    {
      label: "Published Events",
      value: publishedEvents,
      icon: "🚀",
      change: "+1",
      description: "this month",
      iconStyle: "from-emerald-500 to-teal-500",
    },
  ];

  const recentEvents = useMemo(
    () => dashboardEvents.slice(0, 3),
    [dashboardEvents]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
              Organizer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              Welcome back 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Here's what's happening with your events.
            </p>
          </div>

          <Link
            to="/create-event"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            + Create Event
          </Link>
        </header>

        {/* Welcome Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-7 shadow-2xl md:p-9">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
              EventMesh
            </p>

            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Manage your events.
              <span className="block text-purple-300">
                Grow your audience.
              </span>
            </h2>

            <p className="mt-4 max-w-xl leading-relaxed text-slate-300">
              Track bookings, monitor event performance and keep
              everything organized from one place.
            </p>
          </div>

          <div className="absolute bottom-5 right-8 hidden text-7xl opacity-20 md:block">
            ✦
          </div>
        </section>

        {/* Stats */}
        <section
          aria-label="Dashboard statistics"
          className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.iconStyle} text-xl shadow-lg`}
                >
                  {stat.icon}
                </div>

                <span className="text-xs font-semibold text-emerald-400">
                  {stat.change}
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-400">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {stat.description}
              </p>
            </article>
          ))}
        </section>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Events */}
          <section className="overflow-visible rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-sm">

            {/* Event Management Header */}
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-purple-300">
                    EVENT MANAGEMENT
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Your Events
                  </h2>
                </div>

                {/* Status Filter */}
                <div>
                  <label
                    htmlFor="status-filter"
                    className="sr-only"
                  >
                    Filter events by status
                  </label>

                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status === "All"
                          ? "All Events"
                          : status}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Event List */}
            <div className="divide-y divide-white/10">

              {filteredEvents.length > 0 ? (

                filteredEvents.map((event) => (

                  <article
                    key={event.id}
                    className="p-5 transition hover:bg-white/[0.03] md:p-6"
                  >

                    <div className="flex flex-col gap-5 md:flex-row md:items-center">

                      {/* Image */}
                      <img
                        src={
                          event.image ||
                          "/placeholder-event.jpg"
                        }
                        alt={event.title}
                        className="h-24 w-full rounded-2xl object-cover md:h-24 md:w-32"
                      />

                      {/* Details */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          {/* Category */}
                          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
                            {event.category}
                          </span>

                          {/* Status */}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              event.status === "Published"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : event.status === "Completed"
                                ? "bg-blue-500/15 text-blue-300"
                                : event.status === "Cancelled"
                                ? "bg-red-500/15 text-red-300"
                                : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {event.status}
                          </span>

                        </div>

                        {/* Title */}
                        <h3 className="mt-2 truncate text-lg font-bold">
                          {event.title}
                        </h3>

                        {/* Date and Location */}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span>
                            📅 {event.displayDate}
                          </span>

                          <span>
                            📍 {event.location}
                          </span>
                        </div>

                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-5 text-center md:flex md:items-center">

                        <div>
                          <p className="text-xl font-bold text-white">
                            {event.bookings}
                          </p>

                          <p className="text-xs text-slate-500">
                            Bookings
                          </p>
                        </div>

                        <div>
                          <p className="text-xl font-bold text-purple-300">
                            ₹
                            {(
                              (event.price || 0) *
                              event.bookings
                            ).toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-500">
                            Revenue
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Controls */}
                    <div className="mt-5 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* Change Status */}
                      <div>
                        <label
                          htmlFor={`status-${event.id}`}
                          className="mr-2 text-xs text-slate-500"
                        >
                          Change status
                        </label>

                        <select
                          id={`status-${event.id}`}
                          value={event.status}
                          onChange={(e) =>
                            changeStatus(
                              event.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                        >
                          {statusOptions
                            .filter(
                              (status) =>
                                status !== "All"
                            )
                            .map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Event Actions */}
                      <div className="flex items-center gap-2">

                        {/* View Event */}
                        <Link
                          to={`/event/${event.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          View Event →
                        </Link>

                        {/* Three Dot Menu */}
                        <details className="relative">

                          <summary
                            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg bg-white/10 text-xl font-bold text-slate-300 transition hover:bg-white/20 hover:text-white"
                            aria-label={`Actions for ${event.title}`}
                          >
                            ⋮
                          </summary>

                          {/* Edit / Delete Menu */}
                          <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">

                            {/* Edit */}
                            <Link
                              to={`/edit-event/${event.id}`}
                              className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                            >
                              ✏️ Edit
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(event.id)
                              }
                              className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </details>

                      </div>

                    </div>

                  </article>

                ))

              ) : (

                <div
                  role="status"
                  className="px-6 py-16 text-center"
                >
                  <div className="text-5xl">
                    📭
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    No events found
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Try selecting a different status
                    filter.
                  </p>
                </div>

              )}

            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-6">

            {/* Quick Actions */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  ⚡
                </span>

                <div>
                  <p className="text-sm font-semibold text-purple-300">
                    QUICK ACTIONS
                  </p>

                  <h2 className="text-xl font-bold">
                    Get things done
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                {/* Create Event */}
                <Link
                  to="/create-event"
                  className="rounded-xl bg-purple-600/80 p-4 text-center text-sm font-semibold transition hover:bg-purple-500"
                >
                  <span className="block text-xl">
                    ➕
                  </span>

                  <span className="mt-2 block">
                    Create Event
                  </span>
                </Link>

                {/* Browse Events */}
                <Link
                  to="/student-dashboard"
                  className="rounded-xl bg-blue-600/80 p-4 text-center text-sm font-semibold transition hover:bg-blue-500"
                >
                  <span className="block text-xl">
                    🔎
                  </span>

                  <span className="mt-2 block">
                    Browse Events
                  </span>
                </Link>

                {/* My Bookings */}
                <Link
                  to="/my-bookings"
                  className="rounded-xl bg-pink-600/80 p-4 text-center text-sm font-semibold transition hover:bg-pink-500"
                >
                  <span className="block text-xl">
                    🎟️
                  </span>

                  <span className="mt-2 block">
                    My Bookings
                  </span>
                </Link>

                {/* Profile */}
                <button
                  type="button"
                  className="rounded-xl bg-emerald-600/80 p-4 text-center text-sm font-semibold transition hover:bg-emerald-500"
                >
                  <span className="block text-xl">
                    👤
                  </span>

                  <span className="mt-2 block">
                    Profile
                  </span>
                </button>

              </div>
            </section>

            {/* Recent Activity */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-purple-300">
                    ACTIVITY
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Recent Events
                  </h2>
                </div>

                <span className="text-2xl">
                  📊
                </span>

              </div>

              <div className="mt-5 space-y-4">

                {recentEvents.map((event) => (

                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-sm">
                      🎫
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold">
                        {event.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {event.bookings} bookings
                      </p>

                    </div>

                  </div>

                ))}

              </div>
            </section>

          </aside>
        </div>

        {/* Bottom CTA */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-6 shadow-2xl md:p-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-2xl font-extrabold">
                Ready for your next event? ✨
              </p>

              <p className="mt-2 text-sm text-purple-100">
                Discover amazing events and create unforgettable
                experiences.
              </p>
            </div>

            <Link
              to="/student-dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-700"
            >
              Explore Events →
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Dashboard;