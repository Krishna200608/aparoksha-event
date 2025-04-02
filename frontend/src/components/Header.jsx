import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { userData, navigate } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img src={assets.header_img} className="w-36 h-36 rounded-full mb-6" />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey{userData ? ' ' + userData.name : ", Welcome Here!"} <br />{" "}
        {userData &&
          (userData.accountType === "Student"
            ? "joined as a Student"
            : "joined as a Member")}
        <img src={assets.hand_wave} className="w-10 aspect-square" />
      </h1>

      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        Welcome to Aparoskha
      </h2>
      <p className="mb-8 max-w-md">
        Welcome to Aparoksha by IIITA! Take a quick tour to explore, register,
        and connect.
      </p>

      <div className="flex justify-between gap-5">
        {!userData && (
          <button
            onClick={() => navigate("/login")}
            className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all"
          >
            Get Started
          </button>
        )}

        {userData && userData.accountType === "Member" && (
          <button
            onClick={() => navigate("/create-event")}
            className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all"
          >
            Create Event
          </button>
        )}

        {userData && userData.accountType === "Student" && (
          <button
            onClick={() => navigate("/register-event")}
            className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all"
          >
            Register Event
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
