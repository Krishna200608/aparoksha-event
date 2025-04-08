import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import EventItem from "../components/EventItem";

const Events = () => {
  const { eventsData, categories, userData, registrationDetails } = useContext(AppContext);

  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilter, setShowFitler] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(eventsData);
  const [sortType, setSortType] = useState("relevant");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [state, setState] = useState(null);
  const [registerdEvents, setRegisteredEvents] = useState([]);


  const handleCategoryChange = (categoryId) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  // Toggle function for subcategory filter
  const handleSubCategoryChange = (subCategory) => {
      setSelectedSubCategory((prev)=>(prev === subCategory ? null : subCategory));
  };

  const stateHandler = (state) => {
      setState((prev)=>(prev === state ? null : state));
  };

  // extract the eventID's which user has registerd
  const registeredEventsfind = async () => {
    registrationDetails.forEach(element => {
      if(element.userID === userData.userID){
        setRegisteredEvents((prev)=>([...prev,element.eventID]));
      }  
    })
  }

  const applyFilter = () => {
    let eventsCopy = eventsData.slice();

    // Filter by selected category if set
    if (selectedCategory) {
      eventsCopy = eventsCopy.filter(
        (e) => e.event.category.categoryID === selectedCategory
      );
    }

    if(selectedSubCategory === "Paid"){
      eventsCopy = eventsCopy.filter(
        (e)=>e.event.eventInfo.registration_fee !== '0.00'
      )
    } else if(selectedSubCategory === "Free") {
      eventsCopy = eventsCopy.filter(
        (e)=>e.event.eventInfo.registration_fee === '0.00'
      )
    }

      // If state is set to 'Registered'
  if (state === "Registered") {
    eventsCopy = eventsCopy.filter((e) =>
      registerdEvents.includes(e.event.eventID)
    );
  } else if (state === "Unregistered") {
    // If state is set to 'Unregistered', include only events the user hasn't registered for
    eventsCopy = eventsCopy.filter((e) =>
      !registerdEvents.includes(e.event.eventID)
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
              a.event.eventInfo.registration_fee -
              b.event.eventInfo.registration_fee
          )
        );
        break;

      case "high-low":
        setFilteredEvents(
          evtCp.sort(
            (a, b) =>
              b.event.eventInfo.registration_fee -
              a.event.eventInfo.registration_fee
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
  }, [selectedCategory, selectedSubCategory, eventsData,state, userData, registrationDetails]);

  useEffect(() => {
    sortEvents();
  }, [sortType]);

  return (
    <div className="min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Navbar />
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
                  className={`h-4 transition-transform duration-200 ${
                    showFilter ? "rotate-90" : ""
                  }`}
                  alt="dropdown icon"
                />
              </p>
              <div className={`${showFilter ? "block" : "hidden"} mt-4`}>

                {/* Category Filter */}

                <div className="border-b pb-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    CATEGORIES
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {categories.map((item) => (
                      <label
                        key={item.categoryID}
                        className="flex items-center gap-2"
                      >
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
                        onChange={(e)=>handleSubCategoryChange(e.target.value)}
                        checked={selectedSubCategory === "Paid"}
                      />
                      Paid
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        className="w-4 h-4"
                        type="checkbox"
                        value="Free"
                        onChange={(e)=>handleSubCategoryChange(e.target.value)}
                        checked={selectedSubCategory === "Free"}
                      />
                      Free
                    </label>
                  </div>
                </div>

                {/* --- Registered or Unregistered */}

                <div className="border-b pb-4 mb-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <label className="flex items-center gap-2">
                      <input
                        className="w-4 h-4"
                        type="checkbox"
                        value="Registered"
                        onChange={(e)=>stateHandler(e.target.value)}
                        checked={state === "Registered"}
                      />
                      Registered
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        className="w-4 h-4"
                        type="checkbox"
                        value="Unregistered"
                        onChange={(e)=>stateHandler(e.target.value)}
                        checked={state === "Unregistered"}
                      />
                      Not registered
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </aside>

          {/* Events Display */}
          <main className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="text-3xl">
                <Title text1={"All"} text2={"Events"} />
              </div>
              <div className="mt-4 sm:mt-0">
                <select
                  onChange={(e) => setSortType(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
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
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Events;
