import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

async function readResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function errorMessage(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join(", ");
  }

  return fallback;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function ManageTickets() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    available_quantity: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please log in again to manage ticket tiers.");
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [eventsResponse, tiersResponse] = await Promise.all([
        fetch(`${API_URL}/events/my-events`, { headers }),
        fetch(`${API_URL}/ticket-tiers/event/${eventId}`, { headers }),
      ]);

      const eventsData = await readResponse(eventsResponse);
      const tiersData = await readResponse(tiersResponse);

      if (!eventsResponse.ok) {
        throw new Error(
          errorMessage(eventsData, "Could not load your events.")
        );
      }

      if (!tiersResponse.ok) {
        throw new Error(
          errorMessage(tiersData, "Could not load ticket tiers.")
        );
      }

      if (!Array.isArray(eventsData)) {
        throw new Error("Unexpected response while loading your events.");
      }

      const selectedEvent = eventsData.find(
        (item) => String(item.id) === String(eventId)
      );

      if (!selectedEvent) {
        throw new Error(
          "This event was not found in your organizer account."
        );
      }

      if (!Array.isArray(tiersData)) {
        throw new Error("Unexpected response while loading ticket tiers.");
      }

      setEvent(selectedEvent);
      setTiers(tiersData);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load ticket management.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Schedule the initial load to avoid synchronous state updates in the effect.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setNotice("");
  }

  function resetForm() {
    setForm({
      name: "",
      price: "",
      available_quantity: "",
    });
    setEditingId(null);
  }

  function startEditing(tier) {
    setEditingId(tier.id);

    setForm({
      name: tier.name || "",
      price: String(tier.price ?? ""),
      available_quantity: String(tier.available_quantity ?? ""),
    });

    setError("");
    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const name = form.name.trim();
    const price = Number(form.price);
    const quantity = Number(form.available_quantity);

    if (!name) {
      setError("Please enter a ticket tier name.");
      return;
    }

    if (form.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid ticket price of 0 or more.");
      return;
    }

    if (
      form.available_quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Enter a whole-number ticket quantity of 0 or more.");
      return;
    }

    const payload = {
      event_id: Number(eventId),
      name,
      price,
      available_quantity: quantity,
    };

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `${API_URL}/ticket-tiers/${editingId}`
          : `${API_URL}/ticket-tiers/`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          errorMessage(data, "Unable to save the ticket tier.")
        );
      }

      resetForm();
      await loadData();

      setNotice(
        isEditing
          ? "Ticket tier updated successfully."
          : "Ticket tier created successfully."
      );
    } catch (err) {
      setError(err.message || "Could not save the ticket tier.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tier) {
    const confirmed = window.confirm(
      `Delete the "${tier.name}" ticket tier?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please log in again to delete ticket tiers.");
      return;
    }

    setDeletingId(tier.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/ticket-tiers/${tier.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await readResponse(response);
        throw new Error(
          errorMessage(data, "Unable to delete the ticket tier.")
        );
      }

      setTiers((current) =>
        current.filter((item) => item.id !== tier.id)
      );

      if (editingId === tier.id) resetForm();

      setNotice("Ticket tier deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete the ticket tier.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-purple-200"
        >
          ← Back to Dashboard
        </Link>

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
            EventMesh Organizer
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Manage Ticket Tiers
          </h1>

          <p className="mt-3 text-slate-400">
            Set up ticket types, prices, and available quantities for your event.
          </p>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-purple-300/20 border-t-purple-400" />
            <p className="text-slate-300">Loading ticket management...</p>
          </section>
        ) : (
          <>
            {event && (
              <section className="mb-6 rounded-2xl border border-purple-300/10 bg-gradient-to-r from-purple-700/20 to-indigo-700/20 p-5">
                <p className="text-sm text-purple-200">Selected Event</p>
                <h2 className="mt-1 text-xl font-bold">{event.title}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {event.location || "Location not set"}
                </p>
              </section>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200"
              >
                {error}
                <button
                  type="button"
                  onClick={loadData}
                  className="ml-3 font-semibold underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            {notice && !error && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"
              >
                {notice}
              </div>
            )}

            {event && (
              <>
                <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl sm:p-8">
                  <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                      {editingId !== null ? "Update Tier" : "New Tier"}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {editingId !== null
                        ? "Edit Ticket Tier"
                        : "Add a Ticket Tier"}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-3">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                          Ticket Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. General Admission"
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="price"
                          className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                          Price (₹)
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="499"
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="available_quantity"
                          className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                          Available Quantity
                        </label>
                        <input
                          id="available_quantity"
                          name="available_quantity"
                          type="number"
                          min="0"
                          step="1"
                          value={form.available_quantity}
                          onChange={handleChange}
                          placeholder="100"
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Saving..."
                          : editingId !== null
                            ? "Save Changes"
                            : "Add Ticket Tier"}
                      </button>

                      {editingId !== null && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                        Ticket Inventory
                      </p>
                      <h2 className="mt-1 text-2xl font-bold">
                        Your Ticket Tiers
                      </h2>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-slate-300">
                      {tiers.length} {tiers.length === 1 ? "tier" : "tiers"}
                    </span>
                  </div>

                  {tiers.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
                      <div className="mb-4 text-5xl">🎟️</div>
                      <h3 className="text-xl font-bold">
                        No ticket tiers yet
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Add your first tier using the form above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {tiers.map((tier) => (
                        <article
                          key={tier.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg transition hover:border-purple-300/20"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/10 text-2xl">
                              🎫
                            </div>

                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                              {Number(tier.available_quantity)} available
                            </span>
                          </div>

                          <h3 className="mt-4 break-words text-xl font-bold">
                            {tier.name}
                          </h3>

                          <p className="mt-2 text-2xl font-bold text-emerald-300">
                            {formatCurrency(tier.price)}
                          </p>

                          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                            <button
                              type="button"
                              onClick={() => startEditing(tier)}
                              disabled={deletingId === tier.id}
                              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(tier)}
                              disabled={deletingId === tier.id || saving}
                              className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                              {deletingId === tier.id
                                ? "Deleting..."
                                : "🗑 Delete"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

        <footer className="mt-10 border-t border-white/10 py-5 text-center text-xs text-slate-500">
          EventMesh · Ticket Management
        </footer>
      </div>
    </main>
  );
}
