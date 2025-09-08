import { useEffect, useState } from "react";
import axios from "axios";
import { baseURL, getHeaders } from "../../helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ContactUpload from "./ContactUpload";
import Avatar from "./Avatar";

const Users = () => {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "registered", "invitable"
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [contactStats, setContactStats] = useState({
    all: 0,
    registered: 0,
    invitable: 0,
  });
  const [allContacts, setAllContacts] = useState([]);  // Store all contacts for filtering
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  // Function to calculate filtered stats
  const calculateFilteredStats = (contactList, searchFilter) => {
    if (!contactList || contactList.length === 0) {
      return { all: 0, registered: 0, invitable: 0 };
    }

    // Apply name filter
    let filteredContacts = contactList;
    if (searchFilter && searchFilter.trim()) {
      const lowerFilter = searchFilter.toLowerCase();
      filteredContacts = contactList.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(lowerFilter) ||
          contact.lastName.toLowerCase().includes(lowerFilter) ||
          contact.phoneNumber.includes(searchFilter)
      );
    }

    // Calculate stats
    const all = filteredContacts.length;
    const registered = filteredContacts.filter(contact => contact.isRegistered).length;
    const invitable = filteredContacts.filter(contact => !contact.isRegistered).length;

    return { all, registered, invitable };
  };

  // Fetch all contacts for filtering (without pagination)
  const fetchAllContacts = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(
        `${baseURL}/users/contacts?filter=&statusFilter=all&page=1&limit=10000`, // Get all contacts
        headers
      );
      
      if (response.status === 200) {
        setAllContacts(response.data.contacts);
        return response.data.contacts;
      }
      return [];
    } catch (error) {
      console.log("Error fetching all contacts", error);
      return [];
    }
  };

  const getAllContacts = async (page = 1) => {
    try {
      setIsLoading(true);
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(
        `${baseURL}/users/contacts?filter=${debouncedFilter}&statusFilter=${statusFilter}&page=${page}&limit=10`,
        headers
      );

      if (response.status === 200) {
        console.log(response.data);
        setContacts(response.data.contacts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.log("Error fetching contacts", error);
      toast.error("Error fetching contacts");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize - fetch all contacts for filtering stats
  useEffect(() => {
    fetchAllContacts();
  }, []);

  // Update stats whenever filter changes
  useEffect(() => {
    if (allContacts.length > 0) {
      const newStats = calculateFilteredStats(allContacts, debouncedFilter);
      setContactStats(newStats);
    }
  }, [allContacts, debouncedFilter]);

  useEffect(() => {
    setCurrentPage(1);
    getAllContacts(1);
  }, [debouncedFilter, statusFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getAllContacts(newPage);
  };

  const handleSendMoney = (contact) => {
    if (contact.isRegistered && contact.registeredUserDetails) {
      // Use the contact name from CSV, not the registered user's name
      const contactName = `${contact.firstName} ${contact.lastName}`;
      navigate("/send", {
        state: {
          id: contact.registeredUserDetails._id,
          name: contactName,
        },
      });
    }
  };

  const handleInvite = (contact) => {
    const message = `Hey ${contact.firstName}, join our Payment Gateway app to send and receive money instantly!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`sms:${contact.phoneNumber}?body=${encodedMessage}`, "_blank");
  };

  const handleUploadSuccess = (data) => {
    setShowUploadModal(false);
    fetchAllContacts(); // Refresh all contacts for filtering
    getAllContacts();
    toast.success(`Added ${data.totalNewContacts} new contacts`);
  };

  const handleAddContact = async () => {
    if (
      !newContact.firstName.trim() ||
      !newContact.lastName.trim() ||
      !newContact.phoneNumber.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // phone number validation using regex
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(newContact.phoneNumber.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsAddingContact(true);
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.post(
        `${baseURL}/users/addContact`,
        {
          firstName: newContact.firstName.trim(),
          lastName: newContact.lastName.trim(),
          phoneNumber: newContact.phoneNumber.trim(),
        },
        headers
      );

      if (response.status === 200) {
        toast.success("Contact added successfully");
        setNewContact({ firstName: "", lastName: "", phoneNumber: "" });
        setShowAddContactModal(false);
        fetchAllContacts(); // Refresh all contacts for filtering
        getAllContacts(1);
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to add contact");
      }
    } finally {
      setIsAddingContact(false);
    }
  };

  return (
    <div className="mt-8">
      <ContactUpload onUploadSuccess={handleUploadSuccess} />

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Contacts
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
              {contactStats.all} total contacts
            </span>
            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center sm:justify-start space-x-2 cursor-pointer text-sm sm:text-base ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span>All</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === "all" ? "bg-blue-500" : "bg-gray-400"
                }`}
              >
                {contactStats.all}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("registered")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center sm:justify-start space-x-2 cursor-pointer text-sm sm:text-base ${
                statusFilter === "registered"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Registered</span>
                <span className="sm:hidden">Active</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === "registered" ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {contactStats.registered}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("invitable")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center sm:justify-start space-x-2 cursor-pointer text-sm sm:text-base ${
                statusFilter === "invitable"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Can Invite</span>
                <span className="sm:hidden">Invite</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === "invitable" ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                {contactStats.invitable}
              </span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts && contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 gap-3"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <Avatar 
                      name={`${contact.firstName} ${contact.lastName}`}
                      size="md"
                      gradient="blue"
                    />
                    <div className="flex-1 sm:flex-none">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {contact.phoneNumber}
                      </p>
                      {contact.isRegistered && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    {contact.isRegistered ? (
                      <button
                        onClick={() => handleSendMoney(contact)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium cursor-pointer text-sm sm:text-base"
                      >
                        Send Money
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInvite(contact)}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium cursor-pointer text-sm sm:text-base"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No contacts yet</p>
                <p className="text-gray-400">
                  Upload a CSV file to add your contacts
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !isLoading && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-3 py-2 rounded-lg ${
                pagination.hasPrevPage
                  ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } transition-colors`}
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-2 rounded-lg ${
                pagination.hasNextPage
                  ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } transition-colors`}
            >
              Next
            </button>
          </div>
        )}

        {/* Page info */}
        {pagination && !isLoading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing page {pagination.currentPage} of {pagination.totalPages}(
            {pagination.totalContacts} total contacts)
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Add New Contact
              </h3>
              <p className="text-sm text-gray-500">
                Enter the contact details below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={newContact.firstName}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter first name"
                  disabled={isAddingContact}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newContact.lastName}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter last name"
                  disabled={isAddingContact}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newContact.phoneNumber}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="9988554433"
                  disabled={isAddingContact}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddContactModal(false);
                  setNewContact({
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                  });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
                disabled={isAddingContact}
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                disabled={isAddingContact}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingContact ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
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
                    Adding...
                  </span>
                ) : (
                  "Add Contact"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
