import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const RegisterEventForm = () => {
  axios.defaults.withCredentials = true;

  const { navigate, backendUrl, userData, getUserData } = useContext(AppContext);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);

  // Fetch events from the backend when the component mounts
  useEffect(() => {
    axios
      .get(`${backendUrl}/api/events/event`)
      .then((response) => {
        if (response.data.success) {
          setEvents(response.data.events);
        } else {
          toast.error("Failed to load events");
        }
      })
      .catch((error) => {
        console.error("Error loading events:", error);
        toast.error("Error loading events");
      });

      getUserData();
  }, [backendUrl]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Check if user is authenticated using userData from AppContext
    if (!userData) {
      toast.error("User not authenticated");
      return;
    }

    // Validate that an event has been selected
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    try {
      // Only send event_id since middleware automatically attaches user_id in headers
      // console.log(selectedEvent);
      const response = await axios.post(
        `${backendUrl}/api/events/register-for-event`,
        { eventID: selectedEvent }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Error registering for event");
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
          Register for Event
        </h2>
        <p className="text-center text-sm mb-6">
          Select an event from the list below to register.
        </p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-transparent outline-none w-full text-indigo-300"
              required
            >
              <option value="">Select an event</option>
              {events.map((event, index) => (
                <option key={index} value={event.eventID}>
                  {event.title} - {new Date(event.date).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEventForm;
