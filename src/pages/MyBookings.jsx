import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const savedBookings =
      JSON.parse(localStorage.getItem("eventmeshBookings")) || [];

    setBookings(savedBookings);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
            Student Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">
            My Bookings
          </h1>

          <p className="mt-3 text-slate-400">
            View and manage your event bookings.
          </p>
        </section>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto max-w-md">

              <div className="text-5xl">
                🎟️
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No bookings yet
              </h2>

              <p className="mt-3 text-slate-400">
                You haven't booked any events yet. Explore upcoming events
                and book your first ticket.
              </p>

              <Link
                to="/student-dashboard#events"
                className="mt-6 inline-block rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition hover:from-purple-700 hover:to-indigo-700"
              >
                Explore Events
              </Link>

            </div>
          </section>
        ) : (
          /* Booking List */
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl"
              >

                {/* Event Image */}
                <img
                  src={booking.image || "/placeholder-event.jpg"}
                  alt={booking.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-6">

                  {/* Category */}
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    {booking.category}
                  </span>

                  {/* Event Name */}
                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {booking.title}
                  </h2>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>📅 {booking.date}</p>
                    <p>📍 {booking.location}</p>
                    <p>
                      🎟️ {booking.quantity} ticket
                      {booking.quantity !== 1 ? "s" : ""}
                    </p>
                    <p>💰 ₹{booking.total}</p>
                  </div>

                  {/* Booking Status */}
                  <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    ✓ Booking Confirmed
                  </div>

                  {/* Booking Date */}
                  <p className="mt-4 text-xs text-slate-400">
                    Booked on {booking.bookingDate}
                  </p>

                  {/* View Ticket */}
                  <Link
                    to={`/my-tickets#ticket-${booking.id}`}
                    className="mt-5 block w-full rounded-xl bg-purple-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-purple-700"
                  >
                    🎟️ View Ticket
                  </Link>

                </div>
              </article>
            ))}
          </section>
        )}

      </div>
    </main>
  );
}

export default MyBookings;