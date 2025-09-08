import { useEffect, useState } from "react";
import Appbar from "./helper/Appbar";
import Balance from "./helper/Balance";
import Users from "./helper/Users";
import MoneyReceivedPopup from "./MoneyReceivedPopup";
import axios from "axios";
import { baseURL } from "../helper";
import { getHeaders } from "../helper";
import { toast } from "react-toastify";
import useWebSocket from "../hooks/useWebSocket";
import { parseServerBalance } from "../utils/balanceUtils";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { isConnected, notifications, currentMoneyNotification, showMoneyPopup, closeMoneyPopup, clearNotifications } = useWebSocket(token);
  
  const fetchBalance = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(`${baseURL}/accounts/balance`, headers);
      if (response.status !== 200) {
        toast.error("Error in fetching balance");
      }

      setBalance(parseServerBalance(response.data.balance));
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

  // Refresh balance when a new money received notification comes in
  useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification && latestNotification.type === 'money_received') {
      fetchBalance();
    }
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Appbar 
        isConnected={isConnected}
        notifications={notifications}
        clearNotifications={clearNotifications}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Balance value={balance} loading={loading} />
          <Users />
        </div>
      </div>
      
      {/* Money Received Popup */}
      <MoneyReceivedPopup 
        notification={currentMoneyNotification}
        isVisible={showMoneyPopup}
        onClose={closeMoneyPopup}
      />
    </div>
  );
};

export default Dashboard;
