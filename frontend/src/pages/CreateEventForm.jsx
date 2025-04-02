import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const CreateEventForm = () => {
  axios.defaults.withCredentials = true;

  const { navigate, backendUrl } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [prizes, setPrizes] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!title || !eventDate) {
      toast.error("Event title and date are required");
      return;
    }

    try {
      const data = {
        title,
        description,
        event_date: eventDate,
        location: location || null,
        registration_fee: registrationFee || 0,
        prizes,
      };

      const response = await axios.post(
        `${backendUrl}/api/events/create-event`,
        data
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Optionally clear the form or redirect
        setTitle("");
        setDescription("");
        setEventDate("");
        setLocation("");
        setRegistrationFee("");
        setPrizes("");
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Error creating event");
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
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-116 text-indigo-300">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Create Event
        </h2>
        <p className="text-center text-sm mb-6">
          Fill in the details to create a new event.
        </p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent outline-none w-full"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-[20px] bg-[#333A5C]">
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent outline-none w-full resize-none"
              rows="3"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="datetime-local"
              placeholder="Event Date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-transparent outline-none w-full"
              required
            />
          </div>
          {/* New Input for Location */}
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="number"
              placeholder="Registration Fee"
              value={registrationFee}
              onChange={(e) => setRegistrationFee(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="text"
              placeholder="Prizes"
              value={prizes}
              onChange={(e) => setPrizes(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;
