import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { userData, navigate } = useContext(AppContext);

  return (
    <div className="hero min-h-screen w-full mt-30 flex justify-center text-center bg-[url('/Home.jpg')] bg-cover">
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center flex justify-center items-center">
        <div className="text-white w-full mx-auto items-center flex flex-col justify-center">
          {userData ? (
            <>
              <h1 className="mb-5 text-7xl font-bold">Hey {userData.name}</h1>
              <p className="mb-5 max-w-md text-xl">
                {userData.accountType === "Student"
                  ? "joined as a Student"
                  : "joined as a Member"}
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-5 text-7xl font-bold">Welcome to Aparoksha</h1>
              <p className="mb-5 max-w-md text-lg">
                Join our premier college technical event featuring innovative
                workshops and inspiring talks.
              </p>
            </>
          )}
          <button
            onClick={() => !userData ? navigate("/login") : navigate("/events")}
            className="max-w-1/2 bg-gradient-to-r from-[#5dade2] via-[#3498db] to-[#21618c]
             hover:from-[#3498db] hover:via-[#21618c] hover:to-[#1b4f72]
             text-white py-2 px-4 rounded-md cursor-pointer
             transition-colors duration-200"
          >
            {userData ? 'Browse Events' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
