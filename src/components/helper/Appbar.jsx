import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL, getHeaders } from "../../helper";

const Appbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropDownRef = useRef();
  const navigate = useNavigate();

  if (!user) {
    return null; // or a loading spinner, or redirect to login
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.delete(`${baseURL}/users/deleteAccount`, headers);
      
      if (response.status === 200) {
        toast.success("Account deleted successfully");
        logout();
        navigate("/signup");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="h-16 flex justify-between items-center px-4 sm:px-6 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 shadow-sm relative z-20">
        <div className="flex items-center space-x-4 sm:space-x-10">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent hidden sm:block">
              Payment Gateway
            </div>
            <div className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent sm:hidden">
              PayGate
            </div>
          </div>
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/transactions"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Transactions</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="relative" ref={dropDownRef}>
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none bg-white hover:bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span className="font-medium text-gray-700 hidden sm:inline">Hello, {user.firstName}</span>
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-sm sm:text-base">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 text-sm animate-fade-in z-30">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account</p>
            </div>
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
                navigate("/signup");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all duration-150 cursor-pointer flex items-center space-x-3 group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-700">Logout</span>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
            </button>
            <div className="mx-3 border-t border-gray-100"></div>
            <button
              onClick={() => {
                setDropdownOpen(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-50 transition-all duration-150 cursor-pointer flex items-center space-x-3 group"
            >
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <svg className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-red-600">Delete Account</span>
                <p className="text-xs text-gray-500">Permanently remove your account</p>
              </div>
            </button>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <nav className="flex flex-col space-y-1 p-4">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link
              to="/transactions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Transactions</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5C3.498 16.333 4.46 18 6 18z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone. All your data, including contacts, transactions, and account balance will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appbar;
