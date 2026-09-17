import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Event Image */}
      <div className="relative overflow-hidden">
        <img
          src={event.image || "/placeholder-event.jpg"}
          alt={event.title}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category */}
        <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-purple-200 backdrop-blur-sm">
          {event.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {event.title}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            <span aria-hidden="true">📅</span>{" "}
            {event.displayDate}
          </p>

          <p>
            <span aria-hidden="true">📍</span>{" "}
            {event.location}
          </p>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-lg font-extrabold text-purple-600">
            {event.price > 0 ? `From ₹${event.price}` : "Free"}
          </p>

          <span className="text-xs font-medium text-slate-400">
            Available
          </span>
        </div>

        {/* Button */}
        <Link
          to={`/event/${event.id}`}
          className="mt-5 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-center font-semibold text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        >
          View Event →
        </Link>
      </div>
    </article>
  );
}

export default EventCard;