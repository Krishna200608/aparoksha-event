import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const CreateEventForm = () => {
  axios.defaults.withCredentials = true;

  const { navigate, backendUrl, venues, organizers, categories, sponsors } =
    useContext(AppContext);

  // States for event details with default values
  const [title, setTitle] = useState("Sample Event Title");
  const [description, setDescription] = useState(
    "This is a sample event description."
  );
  const [startDate, setStartDate] = useState("2025-05-01T10:00");
  const [endDate, setEndDate] = useState("2025-05-01T16:00");
  const [registrationDeadline, setRegistrationDeadline] =
    useState("2025-04-30T23:59");
  const [venueID, setVenueID] = useState(venues[0]?.venueID);
  const [organizerID, setOrganizerID] = useState(organizers[0]?.organizerID);
  const [registrationFee, setRegistrationFee] = useState("0.00");
  const [maxParticipants, setMaxParticipants] = useState("100");
  const [prizes, setPrizes] = useState("Sample prizes");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(
    "https://example.com/video"
  );
  const [schedule, setSchedule] = useState("Sample schedule details here.");
  const [termsAndConditions, setTermsAndConditions] = useState(
    "Standard terms and conditions apply."
  );
  const [socialLinks, setSocialLinks] = useState(
    "https://facebook.com/example, https://twitter.com/example"
  );
  const [categoryID, setCategoryID] = useState("1");
  // Use an array to store selected sponsor IDs
  const [sponsorIDs, setSponsorIDs] = useState([]);

  // States for file uploads (images)
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // Handler for checkbox sponsor selection
  const handleSponsorCheckbox = (e, id) => {
    if (e.target.checked) {
      setSponsorIDs([...sponsorIDs, id]);
    } else {
      setSponsorIDs(sponsorIDs.filter((item) => item !== id));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic validation: ensure title and start date are provided
    if (!title || !startDate) {
      toast.error("Event title and start date are required");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const formData = new FormData();
      // Append text fields
      formData.append("title", title);
      formData.append("description", description);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate || "");
      formData.append("registration_deadline", registrationDeadline || "");
      formData.append("venueID", venueID);
      formData.append("organizerID", organizerID);
      formData.append("registration_fee", registrationFee || 0);
      formData.append("max_participants", maxParticipants || "");
      formData.append("prizes", prizes);
      formData.append("video_preview_url", videoPreviewUrl);
      formData.append("schedule", schedule);
      formData.append("terms_and_conditions", termsAndConditions);
      formData.append("social_links", socialLinks);
      formData.append("categoryID", categoryID);
      // Append multiple sponsor IDs as a JSON string
      formData.append("sponsorIDs", JSON.stringify(sponsorIDs));

      // Append file inputs if available
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/events/create-event`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Clear the form or redirect as needed
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setRegistrationDeadline("");
        setVenueID("");
        setOrganizerID("");
        setRegistrationFee("");
        setMaxParticipants("");
        setPrizes("");
        setVideoPreviewUrl("");
        setSchedule("");
        setTermsAndConditions("");
        setSocialLinks("");
        setCategoryID("");
        setSponsorIDs([]);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400 px-6 sm:px-0">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-20 cursor-pointer"
        alt="logo"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-200 text-indigo-300">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Create Event
        </h2>
        <p className="text-center text-sm mb-6">
          Fill in the details to create a new event.
        </p>
        <p
          role="alert"
          className="text-center text-lg text-red-600 mb-6 font-semibold"
        >
           Once created, the event cannot be modified.
        </p>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          {/* Title and Description */}
          <div className="flex flex-col justify-center items-center gap-5">
            <div className="w-full flex justify-center">
              <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none"
                required
              />
            </div>
            <div className="w-full flex justify-center">
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none resize-none"
                rows="3"
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <label className="mb-1 text-center text-white">Start Date</label>
              <input
                type="datetime-local"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none max-w-[90%]"
                required
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-1 text-center text-white">End Date</label>
              <input
                type="datetime-local"
                placeholder="End Date (optional)"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none max-w-[90%]"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-1 text-center text-white">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                placeholder="Registration Deadline (optional)"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none max-w-[90%]"
              />
            </div>
          </div>

          {/* Venue and Organizer */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">Select Venue</label>
              <select
                value={venueID}
                onChange={(e) => setVenueID(e.target.value)}
                className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none"
                required
              >
                <option value="">Select Venue</option>
                {venues &&
                  venues.map((venue, index) => (
                    <option key={venue.venueID || index} value={venue.venueID}>
                      {venue.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">Select Organizer</label>
              <select
                value={organizerID}
                onChange={(e) => setOrganizerID(e.target.value)}
                className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none"
                required
              >
                <option value="">Select Organizer</option>
                {organizers &&
                  organizers.map((org, index) => (
                    <option
                      key={org.organizerID || index}
                      value={org.organizerID}
                    >
                      {org.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Financial and Info Fields */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Registration Fee (0.00 if free)"
              value={registrationFee}
              onChange={(e) => setRegistrationFee(e.target.value)}
              className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              placeholder="Max Participants (optional)"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="text"
              placeholder="Prizes (optional)"
              value={prizes}
              onChange={(e) => setPrizes(e.target.value)}
              className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none"
            />
            <input
              type="url"
              placeholder="Video Preview URL (optional)"
              value={videoPreviewUrl}
              onChange={(e) => setVideoPreviewUrl(e.target.value)}
              className="px-5 py-2.5 rounded-[15px] bg-[#333A5C] text-white outline-none"
            />
          </div>

          {/* Text Areas: Schedule, Terms and Conditions, Social Links */}
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">Schedule</label>
              <textarea
                placeholder="Schedule details"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full max-w-[500px] px-3 py-2 rounded-lg bg-[#333A5C] text-white outline-none resize-none"
                rows="3"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">
                Terms and Conditions (optional)
              </label>
              <textarea
                placeholder="Terms and Conditions"
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="w-full max-w-[500px] px-3 py-2 rounded-lg bg-[#333A5C] text-white outline-none resize-none"
                rows="3"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">Social Links (optional)</label>
              <textarea
                placeholder="Social Links (comma-separated or JSON)"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                className="w-full max-w-[500px] px-3 py-2 rounded-lg bg-[#333A5C] text-white outline-none resize-none"
                rows="2"
              />
            </div>
          </div>

          {/* Category and Multiple Sponsor Selection as Checkboxes */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <label className="ml-2 text-sm">Select Category</label>
              <select
                value={categoryID}
                onChange={(e) => setCategoryID(e.target.value)}
                className="px-5 py-2.5 rounded-md bg-[#333A5C] text-white outline-none"
                required
              >
                <option value="">-- Select Category --</option>
                {categories &&
                  categories.map((cat, index) => (
                    <option
                      key={cat.categoryID || index}
                      value={cat.categoryID}
                    >
                      {cat.categoryName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 ">
              <label className="ml-2 text-sm">
                Select Sponsor(s) (optional)
              </label>
              <div className="flex flex-col gap-2">
                {sponsors &&
                  sponsors.map((sponsor) => (
                    <div key={sponsor.sponsorID} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`sponsor-${sponsor.sponsorID}`}
                        value={sponsor.sponsorID}
                        checked={
                          sponsorIDs.includes(sponsor.sponsorID.toString()) ||
                          sponsorIDs.includes(sponsor.sponsorID)
                        }
                        onChange={(e) =>
                          handleSponsorCheckbox(e, sponsor.sponsorID)
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`sponsor-${sponsor.sponsorID}`}
                        className="text-white"
                      >
                        {sponsor.name}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* File Uploads for Images in a Row */}
          <div className="w-full flex flex-col gap-2">
            <p className="mb-2 ml-2">Upload Images (at least 1)</p>
            <div className="flex gap-4">
              <label htmlFor="image1" className="cursor-pointer">
                <img
                  className="w-20"
                  src={
                    !image1 ? assets.upload_area : URL.createObjectURL(image1)
                  }
                  alt="Image 1"
                />
                <input
                  type="file"
                  id="image1"
                  onChange={(e) => setImage1(e.target.files[0])}
                  accept="image/*"
                  hidden
                />
              </label>
              <label htmlFor="image2" className="cursor-pointer">
                <img
                  className="w-20"
                  src={
                    !image2 ? assets.upload_area : URL.createObjectURL(image2)
                  }
                  alt="Image 2"
                />
                <input
                  type="file"
                  id="image2"
                  onChange={(e) => setImage2(e.target.files[0])}
                  accept="image/*"
                  hidden
                />
              </label>
              <label htmlFor="image3" className="cursor-pointer">
                <img
                  className="w-20"
                  src={
                    !image3 ? assets.upload_area : URL.createObjectURL(image3)
                  }
                  alt="Image 3"
                />
                <input
                  type="file"
                  id="image3"
                  onChange={(e) => setImage3(e.target.files[0])}
                  accept="image/*"
                  hidden
                />
              </label>
              <label htmlFor="image4" className="cursor-pointer">
                <img
                  className="w-20"
                  src={
                    !image4 ? assets.upload_area : URL.createObjectURL(image4)
                  }
                  alt="Image 4"
                />
                <input
                  type="file"
                  id="image4"
                  onChange={(e) => setImage4(e.target.files[0])}
                  accept="image/*"
                  hidden
                />
              </label>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex items-center justify-center mt-5">
            <button
              type="submit"
              className="cursor-pointer w-full max-w-[350px] py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;
