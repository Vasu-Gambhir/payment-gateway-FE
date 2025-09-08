import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { baseURL } from "../helper";
import { useAuth } from "../context/AuthContext";

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email;
  const userId = location.state?.userId;

  useEffect(() => {
    if (!email) {
      toast.error("Email not provided. Redirecting to signup...");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${baseURL}/users/verify-email-code`, {
        email: email,
        code: verificationCode
      });

      if (response.status === 200) {
        const { token, user, message } = response.data;
        
        toast.success(message);
        
        // Login the user with the received token
        login(token, user);
        
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Verification failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) {
      toast.error("User ID not available. Please try signing up again.");
      return;
    }

    setResending(true);
    
    try {
      const response = await axios.post(`${baseURL}/users/resend-verification`, {
        userId: userId,
        type: "email"
      });

      if (response.status === 200) {
        toast.success("Verification code sent to your email!");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to resend code";
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4">
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mt-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-semibold">{email}</p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2">
                Please check your email inbox and spam folder
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  loading || verificationCode.length !== 6
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105 cursor-pointer"
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
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  resending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Resend it
              </button>
            </p>
            <p className="text-gray-600 mt-2">
              Wrong email?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up again
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;