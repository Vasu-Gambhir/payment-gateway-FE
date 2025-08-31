import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { baseURL, getHeaders } from "../helper";
import axios from "axios";

const Send = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [name, setName] = useState("");
  const [receiverId, setReciverId] = useState(null);
  const [amount, setAmount] = useState("");
  const [currBalance, setCurrBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const headers = getHeaders(localStorage.getItem("token"));
  const navigate = useNavigate();

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${baseURL}/accounts/balance`, headers);
      if (response.status !== 200) {
        toast.error("Error in fetching your current balance");
      }
      setCurrBalance(response.data.balance);
    } catch (error) {
      console.log("Error while fetching balance", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!amount || parseFloat(amount) <= 0) {
        toast.warn("Please enter a valid amount");
        setLoading(false);
        return;
      }
      if (parseFloat(amount) > currBalance) {
        toast.warn("Insufficient Balance");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${baseURL}/accounts/transfer`,
        {
          recipientId: receiverId,
          amount: parseFloat(amount),
        },
        headers
      );

      if (response.status !== 200) {
        toast.error("Error in transferring money");
        return;
      }

      toast.success(`Successfully transferred $${amount} to ${name}`);
      setAmount("");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error while transferring money"
      );
      console.log("Error while transferring money", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state) {
      setName(location.state.name);
      setReciverId(location.state.id);
    } else {
      setName(searchParams.get("name") || "");
      setReciverId(searchParams.get("id"));
    }
    fetchBalance();
  }, [location.state, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Send Money</h2>
            <p className="text-blue-100">
              Available Balance: ${currBalance.toFixed(2)}
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                {name.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">Sending to</p>
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-4 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Remaining balance: $
                    {(currBalance - parseFloat(amount)).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors cursor-pointer"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  loading || !amount || parseFloat(amount) <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 cursor-pointer"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing Transfer...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Send Money
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Send;
