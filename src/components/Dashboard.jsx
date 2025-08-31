import { useEffect, useState } from "react";
import Appbar from "./helper/Appbar";
import Balance from "./helper/Balance";
import Users from "./helper/Users";
import axios from "axios";
import { baseURL } from "../helper";
import { getHeaders } from "../helper";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const fetchBalance = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(`${baseURL}/accounts/balance`, headers);
      if (response.status !== 200) {
        toast.error("Error in fetching balance");
      }

      setBalance(parseFloat(response.data.balance.toFixed(2)));
    } catch (error) {
      console.log("Error while fetching balance", error);
      toast.error("Error fetching balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Appbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Balance value={balance} loading={loading} />
          <Users />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
