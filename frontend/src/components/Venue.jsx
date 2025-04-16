// Venue.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const VenueForm = ({ onClose }) => {
  const { backendUrl } = useContext(AppContext);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Venue name is required.");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const payload = { name, address };
      const { data } = await axios.post(
        `${backendUrl}/api/events/add-venue`,
        payload
      );

      if (data.success) {
        toast.success(`${data.message}, venueID : ${data.venueID}`);
        // Optionally update the venues list here after a successful add.
        setName("");
        setAddress("");
        onClose(); // Close the dialog on successful submission.
      }
    } catch (err) {
      console.error("Error submitting venue:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while adding the venue.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal container with the form */}
      <div className="relative z-10">
        <div className="p-8 rounded-lg shadow-md max-w-lg w-[375px] mx-auto bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Add Venue</h2>
            <button
              onClick={onClose}
              className="text-red-500 font-bold cursor-pointer"
            >
              Back
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">
                Venue Name*
              </label>
              <input
                autoComplete="off"
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700">
                Address
              </label>
              <input
                autoComplete="off"
                type="text"
                id="address"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E3CCE3] via-[#cd92cd] to-[#E3CCE3]
               hover:from-[#cd92cd] hover:via-[#b54eb5] hover:to-[#a441a4]
               text-black py-2 px-4 rounded-md cursor-pointer
               transition-colors duration-100"
            >
              Add Venue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Venue = () => {
  const { venues, backendUrl, refreshVenues } = useContext(AppContext); // assuming refreshVenues is provided to update the venues list
  const [showForm, setShowForm] = useState(false);
  const [selectedDeleteVenue, setSelectedDeleteVenue] = useState(null);

  const handleDeleteVenue = async (venueID) => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/events/delete-venue`,
        { venueID }
      );

      if (data.success) {
        toast.success(data.message);
        // Call refreshVenues (if provided) or any method to update the venues list.
        if (refreshVenues) refreshVenues();
      }
    } catch (err) {
      console.error("Error deleting venue:", err);
      const errorMessage =
        err.response?.data?.message || "Error deleting venue.";
      toast.error(errorMessage);
    } finally {
      setSelectedDeleteVenue(null);
    }
  };

  return (
    <div className="relative mt-30">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay with blur */}
          <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
          {/* Modal dialog */}
          <div className="z-50">
            <VenueForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {selectedDeleteVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay with blur */}
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-50 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-md text-gray-800 font-medium">
              Delete venue? All linked events will be removed.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedDeleteVenue(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVenue(selectedDeleteVenue)}
                className=" px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Venues</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
            >
              Add Venue
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues && venues.length > 0 ? (
              venues.map((venue) => (
                <div
                  key={venue.venueID}
                  className="bg-white p-4 rounded shadow-md relative"
                >
                  <h2 className="text-2xl font-semibold mb-2">{venue.name}</h2>
                  <p className="text-gray-600">{venue.address}</p>
                  {/* Delete Button (Icon placeholder) */}
                  <button
                    onClick={() => setSelectedDeleteVenue(venue.venueID)}
                    className="absolute top-2 cursor-pointer right-2 text-red-500 hover:text-red-700"
                    title="Delete Venue"
                  >
                    {/* Placeholder for Icon – replace with your icon */}
                    &#x2716;
                  </button>
                </div>
              ))
            ) : (
              <p>No venues available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Venue;
