import { useEffect, useState } from "react";
import User from "./User";
import axios from "axios";
import { baseURL, getHeaders } from "../../helper";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  const getAllUsers = async () => {
    try {
      const headers = getHeaders(localStorage.getItem("token"));

      const response = await axios.get(
        `${baseURL}/users/getUser?filter=${debouncedFilter}`,
        headers
      );

      if (response.status !== 200) {
        toast.error("Error in fetching users");
      }

      setUsers(response.data.users.filter((x) => x.id !== user.id));
      // toast.success("Users fetched successfully");
    } catch (error) {
      console.log("error in fetching users", error);
      toast.error("Error in fetching users");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [debouncedFilter]);

  return (
    <>
      <div className="font-bold mt-6 text-lg">Users</div>
      <div className="my-2">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-2 py-1 border rounded border-slate-200"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div>
        {users && users.length > 0 ? (
          users.map((user) => <User key={user._id} user={user} />)
        ) : (
          <p className="text-sm text-slate-500">No users found</p>
        )}
      </div>
    </>
  );
};

export default Users;
