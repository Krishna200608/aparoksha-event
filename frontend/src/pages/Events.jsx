import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import EventItem from "../components/EventItem";
import Footer from "../components/Footer";

const Events = () => {
  const { eventsData, categories, userData, registrationDetails } =
    useContext(AppContext);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilter, setShowFitler] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(eventsData);
  const [sortType, setSortType] = useState("relevant");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [state, setState] = useState(null);
  const [registerdEvents, setRegisteredEvents] = useState([]);
  const [timing, setTiming] = useState(null);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  // Toggle function for subcategory filter
  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory((prev) => (prev === subCategory ? null : subCategory));
  };

  const stateHandler = (state) => {
    setState((prev) => (prev === state ? null : state));
  };

  // Toggle timeline filter. If the timing is already selected, unset it.
  const timingHandler = (time) => {
    setTiming((prev) => (prev === time ? null : time));
  };

  // Extract the event IDs which the user has registered for
  const registeredEventsfind = async () => {
    registrationDetails.forEach((element) => {
      if (element.userID === userData.userID) {
        setRegisteredEvents((prev) => [...prev, element.eventID]);
      }
    });
  };

  const applyFilter = () => {
    let eventsCopy = eventsData.slice();

    // Filter by selected category if set
    if (selectedCategory) {
      eventsCopy = eventsCopy.filter(
        (e) => e.event.category.categoryID === selectedCategory
      );
    }

    if (selectedSubCategory === "Paid") {
      eventsCopy = eventsCopy.filter(
        (e) => e.event.eventInfo.registration_fee !== "0.00"
      );
    } else if (selectedSubCategory === "Free") {
      eventsCopy = eventsCopy.filter(
        (e) => e.event.eventInfo.registration_fee === "0.00"
      );
    }

    // Filter based on registration state
    if (state === "Registered") {
      eventsCopy = eventsCopy.filter((e) =>
        registerdEvents.includes(e.event.eventID)
      );
    } else if (state === "Unregistered") {
      eventsCopy = eventsCopy.filter(
        (e) => !registerdEvents.includes(e.event.eventID)
      );
    }

    // Filter based on event timing relative to current date and time
    const currentTime = new Date();
    if (timing === "upcoming") {
      eventsCopy = eventsCopy.filter((e) =>
        new Date(e.event.eventInfo.start_date) > currentTime
      );
    } else if (timing === "ongoing") {
      eventsCopy = eventsCopy.filter((e) =>
        new Date(e.event.eventInfo.end_date) > currentTime &&
        new Date(e.event.eventInfo.start_date) < currentTime
      );
    } else if (timing === "concluded") {
      eventsCopy = eventsCopy.filter((e) =>
        new Date(e.event.eventInfo.end_date) < currentTime
      );
    }
    setFilteredEvents(eventsCopy);
  };

  const sortEvents = () => {
    const evtCp = filteredEvents.slice();

    switch (sortType) {
      case "low-high":
        setFilteredEvents(
          evtCp.sort(
            (a, b) =>
              a.event.eventInfo.registration_fee - b.event.eventInfo.registration_fee
          )
        );
        break;
      case "high-low":
        setFilteredEvents(
          evtCp.sort(
            (a, b) =>
              b.event.eventInfo.registration_fee - a.event.eventInfo.registration_fee
          )
        );
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
    registeredEventsfind();
  }, [
    selectedCategory,
    selectedSubCategory,
    eventsData,
    state,
    userData,
    registrationDetails,
    timing,
  ]);

  useEffect(() => {
    sortEvents();
  }, [sortType]);

  return (
    <div className="min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center relative">
      <Navbar />

      {/* Absolute Positioned Timeline Filter */}
      <div className="absolute top-35 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-2 rounded shadow flex space-x-4">
        <label
          className="flex items-center cursor-pointer"
          onClick={() => timingHandler("concluded")}
        >
          <input
            type="checkbox"
            value="concluded"
            onChange={(e) => timingHandler(e.target.value)}
            checked={timing === "concluded"}
            className="w-4 h-4 hidden" // hide the default checkbox
          />
          <div
            className={`w-4 h-4 rounded-full bg-red-500 mr-2 border-2 ${
              timing === "concluded" ? "border-black" : "border-transparent"
            }`}
          ></div>
          <span className="text-sm">Concluded</span>
        </label>
        <label
          className="flex items-center cursor-pointer"
          onClick={() => timingHandler("ongoing")}
        >
          <input
            type="checkbox"
            value="ongoing"
            onChange={(e) => timingHandler(e.target.value)}
            checked={timing === "ongoing"}
            className="w-4 h-4 hidden"
          />
          <div
            className={`w-4 h-4 rounded-full bg-blue-500 mr-2 border-2 ${
              timing === "ongoing" ? "border-black" : "border-transparent"
            }`}
          ></div>
          <span className="text-sm">Ongoing</span>
        </label>
        <label
          className="flex items-center cursor-pointer"
          onClick={() => timingHandler("upcoming")}
        >
          <input
            type="checkbox"
            value="upcoming"
            onChange={(e) => timingHandler(e.target.value)}
            checked={timing === "upcoming"}
            className="w-4 h-4 hidden"
          />
          <div
            className={`w-4 h-4 rounded-full bg-green-500 mr-2 border-2 ${
              timing === "upcoming" ? "border-black" : "border-transparent"
            }`}
          ></div>
          <span className="text-sm">Upcoming</span>
        </label>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-40">
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <p
                onClick={() => setShowFitler(!showFilter)}
                className="text-xl font-semibold cursor-pointer flex items-center justify-between"
              >
                FILTER
                <img
                  src={assets.dropdown_icon}
                  className={`h-4 transition-transform duration-200 ${showFilter ? "rotate-90" : ""}`}
                  alt="dropdown icon"
                />
              </p>
              <div className={`${showFilter ? "block" : "hidden"} mt-4`}>
                {/* Categories Filter */}
                <div className="border-b pb-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    CATEGORIES
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {categories.map((item) => (
                      <label key={item.categoryID} className="flex items-center gap-2">
                        <input
                          className="w-4 h-4"
                          type="checkbox"
                          value={item.categoryName}
                          checked={selectedCategory === item.categoryID}
                          onChange={() => handleCategoryChange(item.categoryID)}
                        />
                        {item.categoryName}
                      </label>
                    ))}
                  </div>
                </div>

                {/* SubCategory Filter */}
                <div className="border-b pb-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    SUB CATEGORIES
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <label className="flex items-center gap-2">
                      <input
                        className="w-4 h-4"
                        type="checkbox"
                        value="Paid"
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                        checked={selectedSubCategory === "Paid"}
                      />
                      Paid
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        className="w-4 h-4"
                        type="checkbox"
                        value="Free"
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                        checked={selectedSubCategory === "Free"}
                      />
                      Free
                    </label>
                  </div>
                </div>

                {/* Optionally, you can remove the Event Timeline Filter from here 
                    since it is now available in the top absolute div */}
                    
                {/* Registered/Unregistered Filter */}
                {userData && userData.isAccountVerified && userData.accountType === "Student" && (
                  <div className="border-b pb-4 mb-4">
                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <label className="flex items-center gap-2">
                        <input
                          className="w-4 h-4"
                          type="checkbox"
                          value="Registered"
                          onChange={(e) => stateHandler(e.target.value)}
                          checked={state === "Registered"}
                        />
                        Registered
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          className="w-4 h-4"
                          type="checkbox"
                          value="Unregistered"
                          onChange={(e) => stateHandler(e.target.value)}
                          checked={state === "Unregistered"}
                        />
                        Not registered
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Events Display */}
          <main className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="text-4xl">
                <Title text1={"All"} text2={"Events"} />
              </div>
              <div className="mt-4 sm:mt-0">
                <select
                  onChange={(e) => setSortType(e.target.value)}
                  className="border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="relevant">Sort by: Relevant</option>
                  <option value="low-high">Sort by: Low to High</option>
                  <option value="high-low">Sort by: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredEvents.map((item) => (
                <EventItem
                  key={item.event.eventID}
                  id={item.event.eventID}
                  title={item.event.title}
                  image={item.event.eventInfo.main_image}
                  registrationFee={item.event.eventInfo.registration_fee}
                  participants={item.event.eventInfo.registered_students}
                  maxParticipant={item.event.eventInfo.max_participants}
                  startDate={item.event.eventInfo.start_date}
                  endDate={item.event.eventInfo.end_date}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Events;
