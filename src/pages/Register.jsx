import { Link } from "react-router-dom";

function Register() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white">
            Join Event<span className="text-purple-400">Mesh</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Create your account and start exploring events
          </p>
        </div>

        <form className="space-y-5">

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

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
              placeholder="Create a password"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:from-purple-700 hover:to-indigo-700"
          >
            Create Account
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Register;