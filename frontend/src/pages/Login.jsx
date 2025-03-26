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
  const [pwdScore, setPwdScore] = useState(0);  // New state to hold password strength score

  // Update password and compute strength
  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    // Evaluate the password using zxcvbn
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

  // Optionally, set a color based on password strength
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
    try {
      // To also send the cookies with the post request
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
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
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
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
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} alt="lock icon" />
              <input
                onChange={handlePasswordChange}
                value={password}
                className="bg-transparent outline-none"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            {state === "Sign Up" && password && (
              <div className="px-5">
                <p className="text-sm">
                  Password Strength: <strong>{getPasswordStrength()}</strong>
                </p>
                {/* Simple progress bar for visual feedback */}
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${(pwdScore / 4) * 100}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer hover:text-indigo-300"
          >
            Forgot password
          </p>

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
