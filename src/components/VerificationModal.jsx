import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL, getHeaders } from "../helper";

const VerificationModal = ({ isOpen, onClose, type, onVerified }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (type === "phone" && !verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    setLoading(true);
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      
      if (type === "phone") {
        const response = await axios.post(
          `${baseURL}/users/verify-phone`,
          { code: verificationCode },
          headers
        );
        
        if (response.data.message) {
          toast.success("Phone verified successfully!");
          onVerified();
          onClose();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.post(
        `${baseURL}/users/resend-verification`,
        { type },
        headers
      );
      
      if (response.data.message) {
        toast.success(response.data.message);
        if (type === "phone" && response.data.code) {
          console.log("Verification code:", response.data.code);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend verification");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          Verify Your {type === "email" ? "Email" : "Phone Number"}
        </h2>
        
        <div className="mb-6">
          {type === "email" ? (
            <p className="text-gray-600">
              We've sent a verification email to your registered email address. 
              Please check your inbox and click the verification link.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Enter the 6-digit verification code sent to your phone:
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter code"
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </>
          )}
        </div>

        <div className="flex gap-3">
          {type === "phone" && (
            <button
              onClick={handleVerify}
              disabled={loading || !verificationCode}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                loading || !verificationCode
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          )}
          
          <button
            onClick={handleResend}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            }`}
          >
            {loading ? "Sending..." : "Resend Code"}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;