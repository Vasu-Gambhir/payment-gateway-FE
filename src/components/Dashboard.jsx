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
  const fetchBalance = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));
      const response = await axios.get(`${baseURL}/accounts/balance`, headers);
      if (response.status !== 200) {
        toast.error("Error in fetching balance");
      }

      setBalance(parseFloat(response.data.balance.toFixed(2)));
      toast.success("balance fetched successfully");
    } catch (error) {
      console.log("Error while fetching balance", error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div>
      <Appbar />
      <div className="m-8">
        <Balance value={balance} />
        <Users />
      </div>
    </div>
  );
};

export default Dashboard;
