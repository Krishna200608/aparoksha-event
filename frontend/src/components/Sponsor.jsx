// Sponsor.jsx
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

// Optional Loader component
const Loader = () => (
  <div className="flex justify-center items-center my-4">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div>
  </div>
);

const SponsorForm = ({ onClose }) => {
  const { backendUrl } = useContext(AppContext);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(assets.upload_area);
  const [isLoading, setIsLoading] = useState(false);

  // Update preview URL when the logo changes and clean up object URL.
  useEffect(() => {
    if (!logo) {
      setPreview(assets.upload_area);
      return;
    }

    const objectUrl = URL.createObjectURL(logo);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error("Both name and description are required.");
      return;
    }

    if (!logo) {
      toast.error("Logo file is required.");
      return;
    }

    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("logo", logo);

      const { data } = await axios.post(
        `${backendUrl}/api/events/add-sponsor`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast.success(`${data.message}`);
        setName("");
        setDescription("");
        setLogo(null);
        onClose(); // Close form modal
      }
    } catch (err) {
      console.error("Error submitting sponsor:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while adding the sponsor.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>
      {/* Form modal container */}
      <div className="relative z-10">
        <div className="p-8 rounded-lg shadow-md max-w-lg w-[450px] mx-auto bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Add Sponsor</h2>
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
                Sponsor Name*
              </label>
              <input
                autoComplete="off"
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sponsor name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700">
                Description*
              </label>
              <textarea
                autoComplete="off"
                id="description"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter sponsor description"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="logo" className="block text-gray-700">
                Sponsor Logo*
              </label>
              {/* Clickable image preview for file selection */}
              <label htmlFor="logo" className="cursor-pointer">
                <img
                  src={preview}
                  className="w-20 border border-gray-300"
                  alt="logo preview"
                />
              </label>
              <input
                type="file"
                id="logo"
                onChange={(e) => setLogo(e.target.files[0])}
                accept="image/*"
                hidden
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E3CCE3] via-[#cd92cd] to-[#E3CCE3]
                hover:from-[#cd92cd] hover:via-[#b54eb5] hover:to-[#a441a4]
                text-black py-2 px-4 rounded-md cursor-pointer transition-colors duration-100"
              disabled={isLoading}
            >
              Add Sponsor
            </button>
            {isLoading && <Loader />}
          </form>
        </div>
      </div>
    </div>
  );
};

const Sponsor = () => {
  const { sponsors, backendUrl, refreshSponsors } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeleteSponsor, setSelectedDeleteSponsor] = useState(null);

  const handleDeleteSponsor = async (sponsorID) => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/events/delete-sponsor`,
        { sponsorID }
      );

      if (data.success) {
        toast.success(data.message);
        if (refreshSponsors) refreshSponsors();
      }
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      const errorMessage =
        err.response?.data?.message || "Error deleting sponsor.";
      toast.error(errorMessage);
    } finally {
      setSelectedDeleteSponsor(null);
    }
  };

  return (
    <div className="relative mt-30">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modal backdrop */}
          <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
          {/* Sponsor form modal */}
          <div className="z-50">
            <SponsorForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {selectedDeleteSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-50 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-sm text-gray-700 font-medium">
            Are you sure you want to delete this sponsor?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedDeleteSponsor(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSponsor(selectedDeleteSponsor)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 cursor-pointer"
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
            <h1 className="text-3xl font-bold">Sponsors</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
            >
              Add Sponsor
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors && sponsors.length > 0 ? (
              sponsors.map((sponsor) => (
                <div
                  key={sponsor.sponsorID}
                  className="bg-white p-4 rounded shadow-md flex flex-col items-center relative"
                >
                  <img
                    src={sponsor.logo_url}
                    alt={`${sponsor.name} logo`}
                    className="w-24 h-24 object-contain mb-4"
                  />
                  <h2 className="text-2xl font-semibold mb-2">
                    {sponsor.name}
                  </h2>
                  <p className="text-gray-600 text-center">
                    {sponsor.description}
                  </p>
                  {/* Delete Icon */}
                  <button
                    onClick={() =>
                      setSelectedDeleteSponsor(sponsor.sponsorID)
                    }
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                    title="Delete Sponsor"
                  >
                    &#x2716;
                  </button>
                </div>
              ))
            ) : (
              <p>No sponsors available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsor;
