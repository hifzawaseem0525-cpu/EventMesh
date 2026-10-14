
function TicketTierSelector({
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
  available,
}) {
  const soldOut = available === 0;
  const isVIP = name === "VIP";

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-200 ${
        soldOut
          ? "border-slate-200 bg-slate-50 opacity-60"
          : isVIP
            ? "border-purple-300 bg-purple-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-purple-200 hover:shadow-sm"
      }`}
    >
      {isVIP && !soldOut && (
        <span className="absolute right-4 top-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
          POPULAR
        </span>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {name} Ticket
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {soldOut ? "Sold out" : `${available} tickets available`}
          </p>

          <p className="mt-3 text-xl font-extrabold text-purple-600">
            {price === 0 ? "Free" : `₹${price}`}
            <span className="ml-1 text-xs font-medium text-slate-400">
              / ticket
            </span>
          </p>
        </div>

        {!soldOut && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={onDecrease}
              disabled={quantity === 0}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Decrease ${name} tickets`}
            >
              −
            </button>

            <span
              className="min-w-[40px] text-center text-lg font-bold text-slate-900"
              aria-live="polite"
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              disabled={quantity >= available}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-xl font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Increase ${name} tickets`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketTierSelector;
