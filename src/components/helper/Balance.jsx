const Balance = ({ value, loading }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-medium mb-2">
            Available Balance
          </p>
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <div className="text-4xl font-bold">
              ${value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
        <div className="bg-white/20 p-4 rounded-full">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <div className="bg-white/10 rounded-lg px-4 py-2">
          <p className="text-xs text-blue-100">Last Transaction</p>
          <p className="text-sm font-semibold">Today</p>
        </div>
        <div className="bg-white/10 rounded-lg px-4 py-2">
          <p className="text-xs text-blue-100">Account Status</p>
          <p className="text-sm font-semibold">Active</p>
        </div>
      </div>
    </div>
  );
};

export default Balance;
