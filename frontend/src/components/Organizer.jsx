// Organizer.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

// Form component for adding an organizer
const OrganizerForm = ({ onClose }) => {
  const { backendUrl } = useContext(AppContext);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Organizer name is required.");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const payload = { name, contact };
      const { data } = await axios.post(
        `${backendUrl}/api/events/add-organiser`,
        payload
      );

      if (data.success) {
        toast.success(`${data.message}, organizerID: ${data.organizerID}`);
        // Optionally update your organizer list here after a successful add.
        setName("");
        setContact("");
        onClose(); // Close the modal on successful submission.
      }
    } catch (err) {
      console.error("Error submitting organizer:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while adding the organizer.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal container with the form */}
      <div className="relative z-10">
        <div className="p-8 rounded-lg shadow-md max-w-lg w-[400px] mx-auto bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Add Organizer</h2>
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
                Organizer Name*
              </label>
              <input
                autoComplete="off"
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organizer name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="contact" className="block text-gray-700">
                Contact
              </label>
              <input
                autoComplete="off"
                type="email"
                id="contact"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter organizer contact"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E3CCE3] via-[#cd92cd] to-[#E3CCE3]
                hover:from-[#cd92cd] hover:via-[#b54eb5] hover:to-[#a441a4]
                text-black py-2 px-4 rounded-md cursor-pointer
                transition-colors duration-100"
            >
              Add Organizer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Organizer = () => {
  const { organizers, backendUrl, refreshOrganizers } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeleteOrganizer, setSelectedDeleteOrganizer] = useState(null);

  const handleDeleteOrganizer = async (organizerID) => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/events/delete-organizer`,
        { organizerID }
      );

      if (data.success) {
        toast.success(data.message);
        // Update organizer list if refreshOrganizers function exists
        if (refreshOrganizers) refreshOrganizers();
      }
    } catch (err) {
      console.error("Error deleting organizer:", err);
      const errorMessage =
        err.response?.data?.message || "Error deleting organizer.";
      toast.error(errorMessage);
    } finally {
      setSelectedDeleteOrganizer(null);
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
            <OrganizerForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {selectedDeleteOrganizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-50 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-sm text-gray-700 font-medium">
              Delete organizer? All linked events will be removed.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedDeleteOrganizer(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrganizer(selectedDeleteOrganizer)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
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
            <h1 className="text-3xl font-bold">Organizers</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
            >
              Add Organizer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizers && organizers.length > 0 ? (
              organizers.map((organizer) => (
                <div
                  key={organizer.organizerID}
                  className="bg-white p-4 rounded shadow-md relative"
                >
                  <h2 className="text-2xl font-semibold mb-2">
                    {organizer.name}
                  </h2>
                  <p className="text-gray-600">{organizer.contact}</p>
                  {/* Delete Button (Icon placeholder) */}
                  <button
                    onClick={() =>
                      setSelectedDeleteOrganizer(organizer.organizerID)
                    }
                    className="absolute cursor-pointer top-2 right-2 text-red-500 hover:text-red-700"
                    title="Delete Organizer"
                  >
                    &#x2716;
                  </button>
                </div>
              ))
            ) : (
              <p>No organizers available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizer;
