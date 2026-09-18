import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/register";

  const linkClass = (path) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      location.pathname === path
        ? "bg-purple-500/20 text-purple-300"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-white/10 bg-slate-950/80 px-6 py-4 shadow-lg backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">

        {/* Logo */}
        <Link
          to={isAuthPage ? "/" : "/student-dashboard"}
          className="shrink-0 text-2xl font-extrabold tracking-tight text-white transition-transform duration-200 hover:scale-105"
        >
          Event<span className="text-purple-400">Mesh</span>
        </Link>

        {/* Student Navigation */}
        {!isAuthPage && (
          <div className="flex flex-wrap items-center justify-end gap-2">

            {/* Dashboard */}
            <Link
              to="/student-dashboard"
              className={linkClass("/student-dashboard")}
            >
              Dashboard
            </Link>

            {/* Events */}
            <a
              href="/student-dashboard#events"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Events
            </a>

            {/* My Bookings */}
            <Link
              to="/my-bookings"
              className={linkClass("/my-bookings")}
            >
              My Bookings
            </Link>

            {/* My Tickets */}
            <Link
              to="/my-tickets"
              className={linkClass("/my-tickets")}
            >
              My Tickets
            </Link>

          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;