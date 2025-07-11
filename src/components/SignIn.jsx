import { useState } from "react";
import BottomWarning from "./helper/BottomWarning";
import Button from "./helper/Button";
import Heading from "./helper/Heading";
import InputBox from "./helper/InputBox";
import SubHeading from "./helper/SubHeading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "../helper";

const defaultSignInData = {
  username: "",
  password: "",
};

const SignIn = () => {
  const [signinData, setSigninData] = useState(defaultSignInData);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setSigninData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!signinData.username || !signinData.password) {
        toast.warn("Please fill all the fields");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signinData.username)) {
        toast.warn("Please enter a valid email address");
        return;
      }

      const response = await axios.post(`${baseURL}/users/signin`, signinData);
      if (response.status !== 201) {
        toast.error("Error while signing in");
        return;
      }
      toast.info("Signing in...");

      const { token, user } = response.data;
      login(token, user);
      toast.success("Sign in successful");
      setSigninData(defaultSignInData);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        // Server responded with status code outside 2xx
        toast.error(error.response.data.error || "Login failed");
      } else if (error.request) {
        // Request was made but no response
        toast.error("No response from server");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-100 text-center p-2 h-max px-4">
          <Heading label={"Sign In"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          <InputBox
            placeholder={"johndoe@gmail.com"}
            label={"Email"}
            name={"username"}
            value={signinData.username}
            onChange={handleChange}
            type={"email"}
            disabled={loading}
          />
          <InputBox
            placeholder={"123456"}
            label={"Password"}
            name={"password"}
            value={signinData.password}
            onChange={handleChange}
            type={"password"}
            disabled={loading}
          />
          <div className="pt-4">
            <Button
              label={loading ? "Signing In..." : "Sign In"}
              onClick={handleSignIn}
              disabled={loading}
              loading={loading}
            />
          </div>
          <BottomWarning
            label={"Don't have an account?"}
            buttonText={"Sign Up"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
