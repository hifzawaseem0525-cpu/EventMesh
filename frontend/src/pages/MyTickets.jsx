import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const savedBookings =
      JSON.parse(localStorage.getItem("eventmeshBookings")) || [];

    setTickets(savedBookings);
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
            My Tickets
          </h1>

          <p className="mt-3 text-slate-400">
            View your confirmed event tickets and booking details.
          </p>
        </section>

        {/* Empty State */}
        {tickets.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto max-w-md">

              <div className="text-5xl">
                🎫
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No tickets yet
              </h2>

              <p className="mt-3 text-slate-400">
                You don't have any confirmed tickets yet.
                Book an event to see your tickets here.
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
          /* Ticket List */
          <section className="grid gap-6 md:grid-cols-2">

            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                id={`ticket-${ticket.id}`}
                className={`overflow-hidden rounded-2xl border bg-white shadow-xl transition ${
                  location.hash === `#ticket-${ticket.id}`
                    ? "border-purple-400 ring-2 ring-purple-400/50"
                    : "border-white/10"
                }`}
              >

                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider">
                      EventMesh
                    </p>

                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                      Confirmed
                    </span>
                  </div>

                  <h2 className="mt-6 text-2xl font-extrabold">
                    {ticket.title}
                  </h2>
                </div>

                {/* Ticket Details */}
                <div className="p-6 text-slate-700">

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 font-semibold">
                        📅 {ticket.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 font-semibold">
                        📍 {ticket.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Tickets
                      </p>

                      <p className="mt-1 font-semibold">
                        🎟️ {ticket.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Total Paid
                      </p>

                      <p className="mt-1 font-semibold">
                        ₹{ticket.total}
                      </p>
                    </div>

                  </div>

                  {/* Divider */}
                  <div className="my-6 border-t border-dashed border-slate-300" />

                  {/* Ticket ID */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Ticket ID
                      </p>

                      <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                        EM-{ticket.id}
                      </p>
                    </div>

                    <div className="text-4xl">
                      🎫
                    </div>
                  </div>

                  {/* Booking Date */}
                  <p className="mt-5 text-xs text-slate-400">
                    Booked on {ticket.bookingDate}
                  </p>

                </div>
              </article>
            ))}

          </section>
        )}

      </div>
    </main>
  );
}

export default MyTickets;