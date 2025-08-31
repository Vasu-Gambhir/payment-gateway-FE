import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { baseURL } from "../helper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const defaultSignupData = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  phone: "",
};

const SignUp = () => {
  const [signupData, setSignupData] = useState(defaultSignupData);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !signupData.firstName ||
        !signupData.lastName ||
        !signupData.username ||
        !signupData.password ||
        !signupData.phone
      ) {
        toast.warn("Please fill all the fields");
        return;
      }
      if (signupData.firstName.length < 3 || signupData.lastName.length < 3) {
        toast.warn(
          "First Name and Last Name should be at least 3 characters long"
        );
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.username)) {
        toast.warn("Please enter a valid email address");
        return;
      }
      if (signupData.password.length < 6) {
        toast.warn("Password should be at least 6 characters long");
        return;
      }
      if (!/^\d{10}$/.test(signupData.phone)) {
        toast.warn("Please enter a valid phone number (10 digits)");
        return;
      }
      toast.info("Signing up...");
      const response = await axios.post(`${baseURL}/users/signup`, signupData);
      if (response.status !== 201) {
        toast.error("Error while signing up");
        return;
      }

      const { token, user } = response.data;
      login(token, user);
      toast.success("Sign up successful");
      setSignupData(defaultSignupData);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error while signing up");
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-600 mt-2">
              Join us to start managing your payments
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={signupData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={signupData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="username"
                value={signupData.username}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={signupData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  loading
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
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;