import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (role === "student") {
      navigate("/student-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white">
            Welcome to Event<span className="text-purple-400">Mesh</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to discover and book events
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          {/* Role Selection */}
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-slate-300">
              Login as
            </legend>

            <div className="grid grid-cols-2 gap-3">

              <label
                className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                  role === "student"
                    ? "border-purple-400 bg-purple-500/20 text-purple-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                Student
              </label>

              <label
                className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                  role === "organizer"
                    ? "border-purple-400 bg-purple-500/20 text-purple-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={role === "organizer"}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                Organizer
              </label>

            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:from-purple-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Login
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Register
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Login;