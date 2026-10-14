import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Format timestamps in Indian Standard Time.
// Assumption: timezone-naive API timestamps represent UTC.
function formatDate(value) {
  if (!value) return "Date not available";

  const rawValue = String(value).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawValue);
  const normalizedValue = hasTimezone ? rawValue : `${rawValue}Z`;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return rawValue;

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function TicketQRCode({ ticketId, token }) {
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    async function loadQR() {
      if (!token || !ticketId) {
        setError("Please log in to load your QR code.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/tickets/${ticketId}/qr`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load the QR code.");
        }

        const imageBlob = await response.blob();
        const newObjectUrl = URL.createObjectURL(imageBlob);

        if (cancelled) {
          URL.revokeObjectURL(newObjectUrl);
          return;
        }

        objectUrl = newObjectUrl;
        setQrUrl(newObjectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load the QR code.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQR();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [ticketId, token]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white text-slate-600">
        Loading QR code...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/40 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-3 text-center">
      <img
        src={qrUrl}
        alt={`QR code for ticket ${ticketId}`}
        className="mx-auto h-48 w-48 object-contain"
      />
      <p className="mt-2 text-xs text-slate-600">
        Show this QR code at event check-in.
      </p>
    </div>
  );
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchParams] = useSearchParams();
  const selectedBookingId = searchParams.get("bookingId");

  const loadTickets = useCallback(async (showLoading = false) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please log in to view your tickets.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!showLoading) {
      setRefreshing(true);
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [ticketsResponse, bookingsResponse] = await Promise.all([
        fetch(`${API_URL}/tickets/me`, { headers }),
        fetch(`${API_URL}/bookings/me`, { headers }),
      ]);

      if (
        ticketsResponse.status === 401 ||
        bookingsResponse.status === 401
      ) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!ticketsResponse.ok) {
        throw new Error("Could not load your tickets.");
      }

      if (!bookingsResponse.ok) {
        throw new Error("Could not load your booking details.");
      }

      const [ticketsData, bookingsData] = await Promise.all([
        ticketsResponse.json(),
        bookingsResponse.json(),
      ]);

      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading tickets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load tickets on page entry without updating state synchronously in the effect.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTickets(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTickets]);

  // Refresh ticket status and check-in times every five seconds.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadTickets(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadTickets]);

  // Scroll to the selected booking's first ticket.
  useEffect(() => {
    if (loading || !selectedBookingId) return;

    const firstTicket = tickets.find(
      (ticket) => String(ticket.booking_id) === selectedBookingId
    );

    if (firstTicket) {
      document
        .getElementById(`ticket-${firstTicket.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, selectedBookingId, tickets]);

  const bookingById = new Map(
    bookings.map((booking) => [String(booking.id), booking])
  );

  const visibleTickets = selectedBookingId
    ? tickets.filter(
        (ticket) => String(ticket.booking_id) === selectedBookingId
      )
    : tickets;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-pink-300">
              Student Dashboard / My Tickets
            </p>

            <h1 className="text-3xl font-bold">My Tickets</h1>

            <p className="mt-2 text-slate-400">
              View your event tickets and scan-ready QR codes.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-slate-500">
                {refreshing ? "Refreshing tickets..." : "Last updated"}{" "}
                {!refreshing && formatDate(lastUpdated.toISOString())}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadTickets(false)}
              disabled={refreshing}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/my-bookings"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              My Bookings
            </Link>
          </div>
        </div>

        {selectedBookingId && (
          <div className="mb-6">
            <Link
              to="/my-tickets"
              className="text-sm text-pink-300 hover:text-pink-200"
            >
              ← View all tickets
            </Link>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
            Loading your tickets...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6 text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => loadTickets(true)}
              className="mt-4 rounded-lg border border-red-800 px-4 py-2 text-sm hover:bg-red-900/40"
            >
              Try again
            </button>
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              {selectedBookingId
                ? "No tickets found for this booking"
                : "No tickets yet"}
            </h2>

            <p className="mt-2 text-slate-400">
              {selectedBookingId
                ? "This booking may not have any tickets available."
                : "Your tickets will appear here after you book an event."}
            </p>

            <Link
              to="/student-dashboard#events"
              className="mt-6 inline-block rounded-lg bg-pink-400 px-5 py-3 font-semibold text-slate-950 hover:bg-pink-300"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {visibleTickets.map((ticket) => {
              const booking = bookingById.get(String(ticket.booking_id));
              const event = booking?.event;
              const ticketStatus = String(
                ticket.status || "active"
              ).toLowerCase();

              const statusStyles =
                ticketStatus === "active"
                  ? "bg-emerald-950 text-emerald-300"
                  : ticketStatus === "used"
                    ? "bg-blue-950 text-blue-300"
                    : "bg-red-950 text-red-300";

              return (
                <article
                  key={ticket.id}
                  id={`ticket-${ticket.id}`}
                  className={`overflow-hidden rounded-2xl border bg-slate-900 ${
                    String(ticket.booking_id) === selectedBookingId
                      ? "border-pink-400"
                      : "border-slate-800"
                  }`}
                >
                  <div className="border-b border-slate-800 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-pink-300">
                          Event ticket
                        </p>

                        <h2 className="mt-2 text-xl font-bold">
                          {event?.title || `Ticket #${ticket.id}`}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}
                      >
                        {ticketStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-400">Event date</p>
                        <p className="mt-1">
                          {event?.date
                            ? formatDate(event.date)
                            : "Date not set"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">Location</p>
                        <p className="mt-1">
                          {event?.location || "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">Category</p>
                        <p className="mt-1">
                          {event?.category || "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">
                          Ticket number
                        </p>
                        <p className="mt-1">{ticket.sequence}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400">Ticket ID</p>
                        <p className="mt-1 break-all font-mono text-sm">
                          {ticket.ticket_code}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">Booking ID</p>
                        <p className="mt-1">#{ticket.booking_id}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">Issued on</p>
                        <p className="mt-1 text-sm">
                          {formatDate(ticket.created_at)}
                        </p>
                      </div>

                      {ticket.checked_in_at && (
                        <div>
                          <p className="text-sm text-slate-400">
                            Checked in at
                          </p>
                          <p className="mt-1 text-sm">
                            {formatDate(ticket.checked_in_at)}
                          </p>
                        </div>
                      )}

                      {booking && (
                        <p className="text-sm text-slate-400">
                          Booking total:{" "}
                          <span className="font-semibold text-white">
                            ₹{booking.total_amount}
                          </span>
                        </p>
                      )}
                    </div>

                    {ticketStatus === "active" ? (
                      <TicketQRCode
                        ticketId={ticket.id}
                        token={localStorage.getItem("access_token") || ""}
                      />
                    ) : (
                      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-950 p-5 text-center">
                        <p className="text-lg font-semibold">
                          {ticketStatus === "used"
                            ? "Ticket already used"
                            : "Ticket unavailable"}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          {ticketStatus === "used"
                            ? "This ticket has been checked in. Its QR code is no longer displayed."
                            : "This ticket is not available for check-in."}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
