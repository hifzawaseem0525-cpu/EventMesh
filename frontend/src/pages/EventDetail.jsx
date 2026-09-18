import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import events from "../data/Events";

function EventDetail() {
  const { id } = useParams();

  const event = events.find((item) => String(item.id) === String(id));

  const [quantity, setQuantity] = useState(1);
  const [booked, setBooked] = useState(false);

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">Event not found</h1>

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

  const total = event.price * quantity;

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleBooking = () => {
    const existingBookings =
      JSON.parse(localStorage.getItem("eventmeshBookings")) || [];

    const newBooking = {
      id: Date.now(),
      eventId: event.id,
      title: event.title,
      category: event.category,
      date: event.displayDate,
      location: event.location,
      image: event.image,
      quantity: quantity,
      total: total,
      bookingDate: new Date().toLocaleDateString(),
    };

    localStorage.setItem(
      "eventmeshBookings",
      JSON.stringify([...existingBookings, newBooking])
    );

    setBooked(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <Link
          to="/student-dashboard"
          className="mb-6 inline-block text-sm font-semibold text-purple-400 hover:text-purple-300"
        >
          ← Back to Events
        </Link>

        {/* Event Card */}
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

          {/* Image */}
          <img
            src={event.image || "/placeholder-event.jpg"}
            alt={event.title}
            className="h-72 w-full object-cover"
          />

          <div className="p-8">

            {/* Category */}
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
              {event.category}
            </span>

            {/* Title */}
            <h1 className="mt-5 text-4xl font-extrabold text-slate-900">
              {event.title}
            </h1>

            {/* Event Information */}
            <div className="mt-6 grid gap-4 text-slate-700 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">
                  Date
                </p>

                <p className="mt-1 font-semibold">
                  📅 {event.displayDate}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-semibold">
                  📍 {event.location}
                </p>
              </div>

            </div>

            {/* Description */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                About this event
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {event.description ||
                  "Join us for an exciting event filled with learning, networking, and memorable experiences."}
              </p>
            </section>

            {/* Booking */}
            <section className="mt-8 rounded-2xl bg-slate-100 p-6">

              <h2 className="text-2xl font-bold text-slate-900">
                Book Your Tickets
              </h2>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                {/* Quantity */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-600">
                    Number of tickets
                  </p>

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="h-10 w-10 rounded-lg bg-slate-300 text-lg font-bold text-slate-900 hover:bg-slate-400"
                    >
                      −
                    </button>

                    <span className="w-8 text-center text-lg font-bold text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="h-10 w-10 rounded-lg bg-purple-600 text-lg font-bold text-white hover:bg-purple-700"
                    >
                      +
                    </button>

                  </div>
                </div>

                {/* Price */}
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">
                    Total
                  </p>

                  <p className="text-3xl font-extrabold text-purple-600">
                    ₹{total}
                  </p>
                </div>

              </div>

              {/* Book Button */}
              <button
                type="button"
                onClick={handleBooking}
                disabled={booked}
                className={`mt-6 w-full rounded-xl px-6 py-3 font-bold text-white transition ${
                  booked
                    ? "cursor-not-allowed bg-green-600"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                }`}
              >
                {booked ? "Booking Confirmed ✓" : "Book Now"}
              </button>

              {/* Confirmation */}
              {booked && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-green-700">

                  <p className="font-bold">
                    Your booking has been confirmed!
                  </p>

                  <p className="mt-1 text-sm">
                    {quantity} ticket
                    {quantity !== 1 ? "s" : ""} booked for{" "}
                    {event.title}.
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

          </div>
        </article>

      </div>
    </main>
  );
}

export default EventDetail;