import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/register";

  const isOrganizer = localStorage.getItem("role") === "organizer";

  const linkClass = (path) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      location.pathname === path
        ? "bg-purple-500/20 text-purple-300"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/");
  };

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-white/10 bg-slate-950/80 px-6 py-4 shadow-lg backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">

        {/* Logo */}
        <Link
          to={isAuthPage ? "/" : isOrganizer ? "/dashboard" : "/student-dashboard"}
          className="shrink-0 text-2xl font-extrabold tracking-tight text-white transition-transform duration-200 hover:scale-105"
        >
          Event<span className="text-purple-400">Mesh</span>
        </Link>

        {/* Navigation */}
        {!isAuthPage && (
          <div className="flex flex-wrap items-center justify-end gap-2">

            {isOrganizer ? (
              <>
                <Link
                  to="/dashboard"
                  className={linkClass("/dashboard")}
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-event"
                  className={linkClass("/create-event")}
                >
                  Create Event
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/student-dashboard"
                  className={linkClass("/student-dashboard")}
                >
                  Dashboard
                </Link>

                <a
                  href="/student-dashboard#events"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Events
                </a>

                <Link
                  to="/my-bookings"
                  className={linkClass("/my-bookings")}
                >
                  My Bookings
                </Link>

                <Link
                  to="/my-tickets"
                  className={linkClass("/my-tickets")}
                >
                  My Tickets
                </Link>
              </>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              Logout
            </button>

          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;