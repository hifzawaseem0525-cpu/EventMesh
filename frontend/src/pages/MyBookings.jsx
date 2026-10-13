
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Please log in to view your bookings.");
          return;
        }

        const response = await fetch(`${API_URL}/bookings/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.detail || "Unable to load your bookings."
          );
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
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

        {/* Loading State */}
        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-slate-300">
              Loading your bookings...
            </p>
          </section>
        ) : error ? (
          /* Error State */
          <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-10 text-center">
            <h2 className="text-xl font-bold text-red-300">
              Couldn't load bookings
            </h2>

            <p className="mt-3 text-slate-300">
              {error}
            </p>
          </section>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto max-w-md">
              <div className="text-5xl">🎟️</div>

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
            {bookings.map((booking) => {
              const event = booking.event;

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl"
                >
                  {/* Event Image */}
                  <img
                    src={event?.image || "/placeholder-event.jpg"}
                    alt={event?.title || "Event"}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-6">

                    {/* Category */}
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {event?.category || "Event"}
                    </span>

                    {/* Event Name */}
                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                      {event?.title || `Event #${booking.event_id}`}
                    </h2>

                    {/* Event Details */}
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>
                        📅{" "}
                        {event?.date
                          ? new Date(event.date).toLocaleDateString()
                          : "Date unavailable"}
                      </p>

                      <p>
                        📍 {event?.location || "Location unavailable"}
                      </p>

                      <p>
                        🎟️ {booking.quantity} ticket
                        {booking.quantity !== 1 ? "s" : ""}
                      </p>

                      <p>
                        💰 ₹
                        {Number(booking.total_amount).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p>
                        Ticket Tier ID: {booking.ticket_tier_id}
                      </p>
                    </div>

                    {/* Booking Status */}
                    <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                      ✓ Booking{" "}
                      {booking.status || "confirmed"}
                    </div>

                    {/* Booking Date */}
                    <p className="mt-4 text-xs text-slate-400">
                      Booked on{" "}
                      {booking.created_at
                        ? new Date(
                            booking.created_at
                          ).toLocaleDateString()
                        : "Date unavailable"}
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
              );
            })}
          </section>
        )}

      </div>
    </main>
  );
}

export default MyBookings;
