import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { baseURL, getHeaders } from "../helper";
import axios from "axios";

const Send = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [receiverId, setReciverId] = useState(null);
  const [amount, setAmount] = useState(0);
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
      if (!amount || amount < 0) {
        toast.warn("Please enter a valid amount");
        return;
      }
      if (amount > currBalance) {
        toast.warn("Insufficient Balance");
        return;
      }

      toast.info("Transfering Money");
      const response = await axios.post(
        `${baseURL}/accounts/transfer`,
        {
          recipientId: receiverId,
          amount: parseInt(amount),
        },
        headers
      );

      if (response.status !== 200) {
        toast.error("Error in trasnfering money");
        return;
      }

      toast.success(
        `Money transfered successfully, Rs.${amount} debitted from your acount`
      );
      setAmount(0);
      setLoading(false);
      navigate("/dashboard");

      console.log(response);
    } catch (error) {
      toast.error("Error while transfering money");
      console.log("Error while transfering money", error);
    }
  };

  useEffect(() => {
    setName(searchParams.get("name"));
    setReciverId(searchParams.get("id"));
    fetchBalance();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white shadow-lg rounded-lg border p-6 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Send Money</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-2xl text-white">
                {name[0]?.toLocaleUpperCase()}
              </span>
            </div>
            <h3 className="text-2xl font-semibold">{name}</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none text-gray-700"
              >
                Amount (in Rs)
              </label>
              <input
                type="number"
                id="amount"
                placeholder="Enter amount"
                value={amount}
                disabled={loading}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-10 w-full bg-green-500 text-white rounded-md text-sm font-medium transition hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Transferring...
                </>
              ) : (
                "Initiate Transfer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Send;
