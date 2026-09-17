function StatCard({ title, value, subtitle, trend }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>

      <div className="mt-2 flex items-center gap-2">
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}

        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.startsWith("-") ? "text-red-500" : "text-green-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;