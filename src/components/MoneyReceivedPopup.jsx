import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MoneyReceivedPopup = ({ notification, isVisible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(10); // Auto-close after 10 seconds
  const navigate = useNavigate();
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(10); // Reset timer when popup becomes visible
    }
  }, [isVisible]);

  if (!notification) return null;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {isVisible && (
        <div
          className="fixed bottom-4 right-4 z-50 max-w-sm w-80 animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Notification Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with celebration */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 text-white relative">
              {/* Small confetti */}
              <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-bounce"></div>
              <div
                className="absolute top-3 right-6 w-1 h-1 bg-pink-300 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                  <div>
                    <h3 className="text-lg font-bold">Money Received!</h3>
                    <p className="text-green-100 text-sm">💰 Ka-ching!</p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-40 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(notification.amount)}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {formatTime(notification.timestamp)}
                </div>
              </div>

              <div className="text-gray-700 mb-3">
                <p className="font-medium">From: {notification.senderName}</p>
              </div>

              {/* Progress bar for auto-close */}
              <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / 10) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Auto-close in {timeLeft}s</span>
                <button
                  onClick={() => {
                    // console.log('View transaction details:', notification.transactionId);
                    navigate("/transactions");
                    onClose();
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoneyReceivedPopup;
