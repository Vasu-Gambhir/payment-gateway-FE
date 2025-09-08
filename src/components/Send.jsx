import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { baseURL, getHeaders } from "../helper";
import axios from "axios";
import { parseServerBalance, formatBalance, formatBalanceAfterDeduction } from "../utils/balanceUtils";
import Avatar from "./helper/Avatar";

const Send = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [name, setName] = useState("");
  const [receiverId, setReciverId] = useState(null);
  const [amount, setAmount] = useState("");
  const [currBalance, setCurrBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const headers = getHeaders(localStorage.getItem("token"));
  const navigate = useNavigate();

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${baseURL}/accounts/balance`, headers);
      if (response.status !== 200) {
        toast.error("Error in fetching your current balance");
      }
      setCurrBalance(parseServerBalance(response.data.balance));
    } catch (error) {
      console.log("Error while fetching balance", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input first
    if (!amount || parseFloat(amount) <= 0) {
      toast.warn("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > currBalance) {
      toast.warn("Insufficient Balance");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setShowConfirmModal(false);
    
    try {
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
              Available Balance: ${formatBalance(currBalance)}
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <Avatar 
                name={name} 
                size="lg" 
                gradient="green"
                className="mr-4"
              />
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
                    Remaining balance: ${formatBalanceAfterDeduction(currBalance, parseFloat(amount))}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              disabled={loading}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5C3.498 16.333 4.46 18 6 18z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Transfer</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to send <span className="font-bold text-green-600">${amount}</span> to <span className="font-bold">{name}</span>?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">${amount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-semibold text-gray-900">{name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-semibold text-gray-900">
                    ${formatBalanceAfterDeduction(currBalance, parseFloat(amount))}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Confirm Transfer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Send;
