import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import zxcvbn from "zxcvbn";  // Importing zxcvbn for password strength evaluation

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwdScore, setPwdScore] = useState(0);  // State to hold password strength score
  const [showPassword, setShowPassword] = useState(false);  // State to control password visibility
  const [accountType, setAccountType] = useState("Student"); // New state for account type

  // List of allowed domains for sign up
  const allowedDomains = ["iiita.ac.in", "gmail.com"];

  // Update password and compute strength
  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const evaluation = zxcvbn(pwd);
    setPwdScore(evaluation.score);
  };

  // Convert numeric score to descriptive text
  const getPasswordStrength = () => {
    switch (pwdScore) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  // Return a color based on password strength score
  const getStrengthColor = () => {
    switch (pwdScore) {
      case 0:
        return "#FF0000"; // red
      case 1:
        return "#FF4500"; // orange red
      case 2:
        return "#FFA500"; // orange
      case 3:
        return "#9ACD32"; // yellow green
      case 4:
        return "#008000"; // green
      default:
        return "#ccc";
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Check allowed domain only for Sign Up
    if (state === "Sign Up") {
      const emailParts = email.split("@");
      if (emailParts.length !== 2 || !allowedDomains.includes(emailParts[1].toLowerCase())) {
        toast.error("Please use a valid institute email");
        return;
      }
    }

    if (state === "Sign Up" && (pwdScore === 0 || pwdScore === 1)){
      toast.error("Your password is too weak. Please choose a stronger password");
      return;
    }

    try {
      // To also send the cookies with the post request
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
          accountType  // sending account type
        });

        if (data.success) {
          toast.success(data.message);
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
          accountType  // sending account type
        });

        if (data.success) {
          toast.success(data.message);
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-20 cursor-pointer"
        alt="logo"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="person icon" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="mail icon" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none"
              type="email"
              placeholder="Email id"
              required
            />
          </div>

          <div className="mb-4 flex flex-col gap-2">
            <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} alt="lock icon" />
              <input
                onChange={handlePasswordChange}
                value={password}
                className="bg-transparent outline-none w-full"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-sm text-indigo-300 focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <img src={assets.eye_close} className="w-4 h-4" alt="eye closed" />
                ) : (
                  <img src={assets.eye_open} className="w-4 h-4" alt="eye open" />
                )}
              </button>
            </div>
            {state === "Sign Up" && password && (
              <div className="px-5">
                <p className="text-sm">
                  Password Strength: <strong>{getPasswordStrength()}</strong>
                </p>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${(pwdScore / 4) * 100}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </div>
                {(pwdScore === 0 || pwdScore === 1) && (
                  <p className="text-xs text-red-500 mt-1">
                    Your password is too weak. Please choose a stronger password.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer hover:text-indigo-300"
          >
            Forgot password
          </p>

          {/* Account type selection */}
          <div className="mb-4">
            {/* <label className="block text-sm font-medium mb-2">Account Type</label> */}
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="Student"
                  checked={accountType === "Student"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="form-radio accent-gray-500"
                />
                <span className={`ml-2 ${accountType === "Student" && 'text-white'}`}>Student</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="Member"
                  checked={accountType === "Member"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="form-radio accent-gray-500"
                />
                <span className={`ml-2 ${accountType === "Member" && 'text-white'}`}>Member</span>
              </label>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
