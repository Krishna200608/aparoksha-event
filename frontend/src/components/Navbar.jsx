import React, { useContext } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        toast.success(data.message);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full mx-auto flex justify-between items-center p-4 sm:p-6 absolute top-0 z-50 shadow-md">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-20 h-17 sm:w-20" />
      </Link>
      <div className="flex items-center justify-center gap-8">
        <nav className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-blue-500" : "text-gray-800 hover:text-blue-500"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive ? "text-blue-500" : "text-gray-800 hover:text-blue-500"
            }
          >
            Events
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-blue-500" : "text-gray-800 hover:text-blue-500"
            }
          >
            About us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "text-blue-500" : "text-gray-800 hover:text-blue-500"
            }
          >
            Contact
          </NavLink>
          {userData && userData.accountType === "Member" && (
            <NavLink
              to="/member"
              className={({ isActive }) =>
                isActive ? "text-blue-500" : "text-gray-800 hover:text-blue-500"
              }
            >
              Member
            </NavLink>
          )}
        </nav>
      </div>
      <div>
        {userData ? (
          <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer">
            {userData.name[0].toUpperCase()}
            <div className="absolute hidden group-hover:block top-7 right-0 z-10 text-black rounded pt-2">
              <ul className="list-none w-27 m-0 p-2 bg-gray-100 text-sm">
                {!userData.isAccountVerified && (
                  <li
                    onClick={sendVerificationOtp}
                    className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                  >
                    Verify email
                  </li>
                )}
                <li
                  onClick={logout}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
          >
            Login <img src={assets.arrow_icon} alt="Arrow Icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
