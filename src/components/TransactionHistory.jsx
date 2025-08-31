import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL, getHeaders } from "../helper";
import { toast } from "react-toastify";
import Appbar from "./helper/Appbar";
import { useAuth } from "../context/AuthContext";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const { user } = useAuth();

  const fetchContacts = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(
        `${baseURL}/users/contacts?limit=1000`, // Get all contacts
        headers
      );
      if (response.status === 200) {
        setContacts(response.data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(
        `${baseURL}/accounts/transactions?page=${page}&limit=10`,
        headers
      );

      if (response.status === 200) {
        setTransactions(response.data.transactions);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchTransactions();
  }, []);

  // Helper function to get display name for transaction
  const getDisplayName = (transactionUser, phoneNumber) => {
    // Normalize phone number function (same as backend)
    const normalizePhoneNumber = (phone) => {
      if (!phone) return "";
      return phone.toString().replace(/[\s\-\(\)\+]/g, "").replace(/^91/, "");
    };

    const normalizedTransactionPhone = normalizePhoneNumber(phoneNumber);
    
    // Check if this phone number exists in user's contacts
    const contactMatch = contacts.find(contact => 
      normalizePhoneNumber(contact.phoneNumber) === normalizedTransactionPhone
    );

    if (contactMatch) {
      // If found in contacts, use the contact name from CSV
      return `${contactMatch.firstName} ${contactMatch.lastName}`;
    } else {
      // If not in contacts, use the registered user's name
      return `${transactionUser.firstName} ${transactionUser.lastName}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Appbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h1 className="text-3xl font-bold text-white">
                Transaction History
              </h1>
              <p className="text-blue-100 mt-2">
                View all your incoming and outgoing transactions
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-20 h-20 mx-auto text-gray-400 mb-4"
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
                <p className="text-gray-500 text-lg">No transactions yet</p>
                <p className="text-gray-400 mt-2">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="p-6 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === "sent"
                              ? "bg-red-100"
                              : "bg-green-100"
                          }`}
                        >
                          {transaction.type === "sent" ? (
                            <svg
                              className="w-6 h-6 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16l-4-4m0 0l4-4m-4 4h18"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.type === "sent" ? "Sent to" : "Received from"}{" "}
                            {transaction.type === "sent"
                              ? getDisplayName(transaction.toUserId, transaction.toUserId.phone)
                              : getDisplayName(transaction.fromUserId, transaction.fromUserId.phone)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.type === "sent"
                              ? transaction.toUserId.phone
                              : transaction.fromUserId.phone}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === "sent"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "sent" ? "-" : "+"}
                          {formatAmount(transaction.ammount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50 shadow-md cursor-pointer"
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50 shadow-md cursor-pointer"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;