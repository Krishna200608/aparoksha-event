// Sidebar.jsx
import React from "react";
import { assets } from "../assets/assets";

const Sidebar = ({ expand, setExpand, activeView, onNavigate }) => {
  // Function to return conditional classes for buttons
  const getButtonClasses = (view) => {
    // When expanded, use full-width button with padding; otherwise a compact button.
    // Change background color to dark when this view is active.
    const baseClass = expand
      ? "rounded-2xl gap-2 p-2.5 w-full"
      : "group relative h-9 w-9 mx-auto hover:bg-gray-300 rounded-lg";
    const bgClass =
      expand && activeView === view ? "bg-gray-400" : "bg-primary hover:bg-gray-500";
    return `flex pl-10 cursor-pointer ${baseClass} ${bgClass}`;
  };

  return (
    <div
      className={`flex flex-col justify-between bg-[#e5e5e5] pt-7 transition-all z-50 max-md:absolute max-md:h-screen border-r-2 border-t-2 border-gray-400 ${
        expand ? "p-4 w-64 mt-29" : "md:w-20 w-0 max-md:overflow-hidden mt-29"
      }`}
    >
      <div>
        <div
          className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}
        >
          <div
            onClick={() => setExpand(!expand)}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer"
          >
            <img src={assets.menu_icon} alt="Menu" className="md:hidden" />
            <img
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
              alt="Menu Toggle"
              className="hidden md:block w-12"
            />
            <div
              className={`absolute w-max ${expand ? "left-12 -translate-x-1/2 -top-12" : "-top-12 left-0"} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}
            >
              {expand ? "Close sidebar" : "Open Sidebar"}
              <div
                className={`w-3 h-3 absolute bg-black rotate-45 ${
                  expand ? "left-6 -bottom-1.5 -translate-x-1/2" : "left-3 -bottom-1.5"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Events Button */}
        <button
          onClick={() => onNavigate("events")}
          className={`${getButtonClasses("events")} mt-4`}
        >
          <img src={assets.star_event_icon} className="w-6.5" alt="Events" />
          {expand && <p className="text-black font-medium">Events</p>}
        </button>

        <hr className={`${expand ? "mx-auto w-9/10 mt-2 mb-2" : "hidden"}`} />

        {/* Venue Button */}
        <button
          onClick={() => onNavigate("venue")}
          className={getButtonClasses("venue")}
        >
          <img src={assets.location} className="w-5" alt="Venue" />
          {expand && <p className="text-black font-medium">Venue</p>}
        </button>

        <hr className={`${expand ? "mx-auto w-9/10 mt-2 mb-2" : "hidden"}`} />

        {/* Organizers Button */}
        <button
          onClick={() => onNavigate("organizer")}
          className={getButtonClasses("organizer")}
        >
          <img src={assets.organiser} className="w-5" alt="Organizers" />
          {expand && <p className="text-black font-medium">Organizers</p>}
        </button>
        <hr className={`${expand ? "mx-auto w-9/10 mt-2 mb-2" : "hidden"}`} />

        {/* Sponsor Button */}
        <button
          onClick={() => onNavigate("sponsor")}
          className={getButtonClasses("sponsor")}
        >
          <img src={assets.sponsor} className="w-5" alt="Sponsor" />
          {expand && <p className="text-black font-medium">Sponsors</p>}
        </button>
        <hr className={`${expand ? "mx-auto w-9/10 mt-2 mb-2" : "hidden"}`} />

        {/* Category Button */}
        <button
          onClick={() => onNavigate("category")}
          className={getButtonClasses("category")}
        >
          <img src={assets.category} className="w-5" alt="Category" />
          {expand && <p className="text-black font-medium">Categories</p>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
