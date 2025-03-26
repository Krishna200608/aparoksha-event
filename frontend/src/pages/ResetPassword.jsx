import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import zxcvbn from "zxcvbn"; // Import zxcvbn

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  // To send the cookies also 
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordScore, setNewPasswordScore] = useState(0); // State for password strength score
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/send-reset-otp", { email });

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async (event) => {
    event.preventDefault();

    const otpArray = inputRefs.current.map((e) => e.value).join("");
    setOtp(otpArray);

    if (!otpArray) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/verify-reset-otp", { email, otp });
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsOtpSubmitted(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handler for new password input that evaluates strength
  const handleNewPasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    const evaluation = zxcvbn(pwd);
    setNewPasswordScore(evaluation.score);
  };

  // Convert numeric score to descriptive text
  const getPasswordStrength = () => {
    switch (newPasswordScore) {
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
    switch (newPasswordScore) {
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

  const onSubmitNewPassword = async (event) => {
    event.preventDefault();

    if (!newPassword) {
      toast.error("New Password is required");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/reset-password", {
        email,
        newPassword,
      });

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
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

      {/* Enter the email id */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <div className="relative">
            <img
              onClick={() => navigate("/login")}
              src={assets.left_arrow}
              className="h-6 w-6 cursor-pointer rounded-full bg-white"
              alt="back arrow"
            />
            <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset password</h1>
          </div>
          <p className="text-center mb-6 text-indigo-300">Enter your registered email address</p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} className="w-3 h-3" alt="mail icon" />
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent outline-none text-white"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <button type="submit" className="cursor-pointer w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}

      {/* OTP input form */}
      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password OTP</h1>
          <p className="text-center mb-6 text-indigo-300">Enter the 6-digit code sent to your email id.</p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
            Submit
          </button>
        </form>
      )}

      {/* Enter New Password */}
      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">New password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter the new password below</p>

          <div className="mb-4 flex flex-col gap-2">
            <div className="relative flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} className="w-3 h-3" alt="lock icon" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-transparent outline-none w-full text-white"
                onChange={handleNewPasswordChange}
                value={newPassword}
                required
              />
              {/* Toggle button for password visibility */}
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-5 text-sm text-indigo-300 focus:outline-none"
                aria-label="Toggle password visibility"
              >
               {showNewPassword ? <img src={assets.eye_close} className="w-4 h-4" alt="eye-open" /> : <img src={assets.eye_open} className="w-4 h-4" alt="eye-open"/>}
              </button>
            </div>
            {newPassword && (
              <div className="px-5">
                <p className="text-sm text-white">
                  Password Strength: <strong>{getPasswordStrength()}</strong>
                </p>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${(newPasswordScore / 4) * 100}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </div>
                {(newPasswordScore === 0 || newPasswordScore === 1) && (
                  <p className="text-xs text-red-500 mt-1">
                    Your password is too weak. Please choose a stronger password.
                  </p>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
