import { useState } from "react";
import BottomWarning from "./helper/BottomWarning";
import Button from "./helper/Button";
import Heading from "./helper/Heading";
import InputBox from "./helper/InputBox";
import SubHeading from "./helper/SubHeading";
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
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-100 text-center p-2 h-max px-4">
          <Heading label={"Sign Up"} />
          <SubHeading label={"Enter your information to create an account"} />
          <InputBox
            placeholder={"John"}
            label={"First Name"}
            name={"firstName"}
            value={signupData.firstName}
            onChange={handleChange}
            type={"text"}
            disabled={loading}
          />
          <InputBox
            placeholder={"Doe"}
            label={"Last Name"}
            name={"lastName"}
            value={signupData.lastName}
            onChange={handleChange}
            type={"text"}
            disabled={loading}
          />
          <InputBox
            placeholder={"johndoe@gmail.com"}
            label={"Email"}
            name={"username"}
            value={signupData.username}
            onChange={handleChange}
            type={"email"}
            disabled={loading}
          />
          <InputBox
            placeholder={"123456"}
            label={"Password"}
            name={"password"}
            value={signupData.password}
            onChange={handleChange}
            type={"password"}
            disabled={loading}
          />
          <InputBox
            placeholder={"9876543210"}
            label={"Phone Number"}
            name={"phone"}
            value={signupData.phone}
            onChange={handleChange}
            type={"text"}
            disabled={loading}
          />
          <div className="pt-4">
            <Button
              label={loading ? "Signing Up..." : "Sign Up"}
              onClick={handleSignUp}
              disabled={loading}
              loading={loading}
            />
          </div>
          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Sign In"}
            to={"/signin"}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
