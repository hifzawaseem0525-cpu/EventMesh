
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function formatDisplayDate(isoDate) {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  if (isNaN(date)) return isoDate;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventDetail() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [ticketTiers, setTicketTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch event details
        const eventResponse = await fetch(
          `${API_URL}/events/${id}`
        );

        const eventData = await eventResponse.json();

        if (!eventResponse.ok) {
          throw new Error(
            eventData.detail || "Failed to load event"
          );
        }

        setEvent(eventData);

        // Fetch ticket tiers using the correct backend endpoint
        const tierResponse = await fetch(
          `${API_URL}/ticket-tiers/event/${id}`
        );

        const tierData = await tierResponse.json();

        if (!tierResponse.ok) {
          throw new Error(
            tierData.detail || "Failed to load ticket tiers"
          );
        }

        setTicketTiers(tierData);

        if (tierData.length > 0) {
          setSelectedTier(tierData[0]);
        } else {
          setSelectedTier(null);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const total =
    selectedTier && quantity
      ? Number(selectedTier.price) * quantity
      : 0;

  const increaseQuantity = () => {
    if (!selectedTier) return;

    setQuantity((current) =>
      Math.min(
        current + 1,
        Math.min(10, selectedTier.available_quantity)
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setBookingError("Please login before booking a ticket.");
      return;
    }

    if (!selectedTier) {
      setBookingError("Please select a ticket tier.");
      return;
    }

    if (selectedTier.available_quantity < quantity) {
      setBookingError("Not enough tickets available.");
      return;
    }

    try {
      setBookingError("");
      setBooking(true);

      const response = await fetch(`${API_URL}/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_tier_id: selectedTier.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Booking failed");
      }

      setBooked(true);

      // Update displayed ticket availability after successful booking
      setTicketTiers((current) =>
        current.map((tier) =>
          tier.id === selectedTier.id
            ? {
                ...tier,
                available_quantity:
                  tier.available_quantity - quantity,
              }
            : tier
        )
      );

      setSelectedTier((current) =>
        current
          ? {
              ...current,
              available_quantity:
                current.available_quantity - quantity,
            }
          : current
      );
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-slate-400">Loading event...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">Event not found</h1>

          <p className="mt-3 text-red-300">
            {error || "This event could not be loaded."}
          </p>

          <Link
            to="/student-dashboard"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/student-dashboard"
          className="mb-6 inline-block text-sm font-semibold text-purple-400 hover:text-purple-300"
        >
          ← Back to Events
        </Link>

        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          <img
            src={event.image || "/placeholder-event.jpg"}
            alt={event.title}
            className="h-72 w-full object-cover"
          />

          <div className="p-8">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
              {event.category}
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-slate-900">
              {event.title}
            </h1>

            <div className="mt-6 grid gap-4 text-slate-700 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Date</p>
                <p className="mt-1 font-semibold">
                  📅 {formatDisplayDate(event.date)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-1 font-semibold">
                  📍 {event.location}
                </p>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                About this event
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {event.description ||
                  "Join us for an exciting event filled with learning, networking, and memorable experiences."}
              </p>
            </section>

            {/* Ticket Tiers */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Choose Your Ticket
              </h2>

              {ticketTiers.length === 0 ? (
                <div className="mt-4 rounded-xl bg-slate-100 p-5 text-slate-600">
                  No tickets are currently available for this event.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {ticketTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier);
                        setQuantity(1);
                        setBooked(false);
                        setBookingError("");
                      }}
                      disabled={tier.available_quantity <= 0}
                      className={`rounded-2xl border p-5 text-left transition ${
                        selectedTier?.id === tier.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 bg-slate-100 hover:border-purple-300"
                      } ${
                        tier.available_quantity <= 0
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <p className="text-lg font-bold text-slate-900">
                        {tier.name}
                      </p>

                      <p className="mt-2 text-2xl font-extrabold text-purple-600">
                        ₹{tier.price}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {tier.available_quantity} tickets available
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Booking */}
            {selectedTier && selectedTier.available_quantity > 0 && (
              <section className="mt-8 rounded-2xl bg-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Book Your Tickets
                </h2>

                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-600">
                      Number of tickets
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={booked || booking}
                        className="h-10 w-10 rounded-lg bg-slate-300 text-lg font-bold text-slate-900 hover:bg-slate-400 disabled:opacity-50"
                      >
                        −
                      </button>

                      <span className="w-8 text-center text-lg font-bold text-slate-900">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={
                          booked ||
                          booking ||
                          quantity >=
                            Math.min(
                              10,
                              selectedTier.available_quantity
                            )
                        }
                        className="h-10 w-10 rounded-lg bg-purple-600 text-lg font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-3xl font-extrabold text-purple-600">
                      ₹{total}
                    </p>
                  </div>
                </div>

                {bookingError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
                    {bookingError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={booking || booked}
                  className={`mt-6 w-full rounded-xl px-6 py-3 font-bold text-white transition ${
                    booked
                      ? "cursor-not-allowed bg-green-600"
                      : booking
                      ? "cursor-not-allowed bg-slate-500"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  }`}
                >
                  {booked
                    ? "Booking Confirmed ✓"
                    : booking
                    ? "Booking..."
                    : "Book Now"}
                </button>

                {booked && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-green-700">
                    <p className="font-bold">
                      Your booking has been confirmed!
                    </p>

                    <p className="mt-1 text-sm">
                      {quantity} ticket{quantity !== 1 ? "s" : ""} booked
                      for {event.title}.
                    </p>

                    <Link
                      to="/my-bookings"
                      className="mt-4 inline-block rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                    >
                      View My Bookings
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

export default EventDetail;
