import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import Title from "./Title";
import Footer from "./Footer";

const MemberEvents = () => {
  // Assuming AppContext provides eventsData array, backendUrl, and setEventsData (optional)
  const { eventsData, backendUrl, setEventsData, navigate } =
    useContext(AppContext);

  // For the event details modal:
  const [selectedEvent, setSelectedEvent] = useState(null);
  // For the delete confirmation overlay modal:
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Function to handle event deletion using axios
  const handleDeleteEvent = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/events/delete-event`,
        {
          eventID: selectedEvent.event.eventID,
        }
      );
      if (data.success) {
        // Optionally update eventsData (if setEventsData is provided)
        if (setEventsData) {
          setEventsData((prev) =>
            prev.filter(
              (item) => item.event.eventID !== selectedEvent.event.eventID
            )
          );
        }
        // Close the confirmation and details modals
        setConfirmDelete(false);
        setSelectedEvent(null);
        toast.success(data.message);
      } else {
        toast.error("Failed to delete event: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Error deleting event");
    }
  };

  const downloadStudents = async () => {
    const count = await getCount(selectedEvent.event.eventID);
    if (count === 0) {
      toast.error("No Registered Student");
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/events/download-students?eventID=${selectedEvent.event.eventID}`,
        { responseType: "blob" }
      );

      // Create a blob URL from the PDF data.
      const pdfBlob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a temporary link element and trigger the download.
      const link = document.createElement("a");
      link.href = url;

      // Try to extract the filename from the response headers
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${selectedEvent.event.title} participants list.pdf`;
      if (
        contentDisposition &&
        contentDisposition.indexOf("filename=") !== -1
      ) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up.
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Successfully downloaded the pdf");
    } catch (error) {
      console.log(error);
      toast.error("Failed to download list of students.");
    }
  };
  const getCount = async (eventid) => {
    // Using Array.find to get the matched event. Adjust based on your data structure.
    const evt = eventsData.find((e) => e.event.eventID === eventid);
    // If no event is found, assume count as 0.
    const count = evt ? evt.event.eventInfo.registered_students : 0;
    return count;
  };

  return (
    <div className="p-6 mt-25">
      {/* Header with Title and "Create Event" button */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl">
          <Title text1={"All"} text2={"Events"} />
        </div>
        {/* Create Event Button */}
        <button
          onClick={() => navigate("/create-event")} // onClick left empty; update as needed
          className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
        >
          Create Event
        </button>
      </div>

      {/* Display event cards if no event is selected */}
      {!selectedEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0">
          {eventsData &&
            eventsData.map((eventItem, index) => {
              const { event } = eventItem;
              const { title, category, eventInfo, venue } = event;
              return (
                <div
                  key={index}
                  className="border rounded-xl shadow hover:shadow-lg transition-all cursor-pointer p-4 bg-white flex flex-col md:flex-row"
                  onClick={() => setSelectedEvent(eventItem)}
                >
                  {/* Details Section */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="mb-1">
                      <span className="font-semibold">Category:</span>{" "}
                      {category.categoryName}
                    </p>
                    <p className="mb-1">
                      <span className="font-semibold">Venue:</span> {venue.name}
                    </p>
                    <p className="mb-1">
                    {(eventInfo.registration_fee) === "0.00"
                    ? "Free"
                    : `Rs. ${eventInfo.registration_fee}`}
                    </p>
                  </div>
                  {/* Main Image Section */}
                  <div className="flex items-center justify-center mt-4 md:mt-0 md:ml-4">
                    <img
                      src={eventInfo.main_image}
                      alt={`${title} main`}
                      className="w-30 h-30 max-w-xs object-cover rounded-xl"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        // Event Details Modal
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 md:w-3/4 lg:w-1/2 overflow-auto max-h-screen relative">
            {/* Back button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="mb-4 px-4 py-2 text-red-500 rounded hover:text-red-700 absolute top-4 right-4 font-bold cursor-pointer"
            >
              Back
            </button>

            {/* Event details */}
            {selectedEvent && (
              <>
                <div className="flex justify-center">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedEvent.event.title}
                  </h2>
                </div>

                <p className="mb-1">
                  <span className="font-semibold">Category:</span>{" "}
                  {selectedEvent.event.category.categoryName}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Venue:</span>{" "}
                  {selectedEvent.event.venue.name}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Registration Fee:</span>{" "}
                  {(selectedEvent.event.eventInfo.registration_fee) === "0.00"
                    ? "Free"
                    : `Rs. ${selectedEvent.event.eventInfo.registration_fee}`}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Description:</span>{" "}
                  {selectedEvent.event.eventInfo.description}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Start Date:</span>{" "}
                  {new Date(
                    selectedEvent.event.eventInfo.start_date
                  ).toLocaleString()}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">End Date:</span>{" "}
                  {new Date(
                    selectedEvent.event.eventInfo.end_date
                  ).toLocaleString()}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Registration Deadline:</span>{" "}
                  {new Date(
                    selectedEvent.event.eventInfo.registration_deadline
                  ).toLocaleString()}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Max Participants:</span>{" "}
                  {selectedEvent.event.eventInfo.max_participants}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Registered Students:</span>{" "}
                  {selectedEvent.event.eventInfo.registered_students}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Schedule:</span>{" "}
                  {selectedEvent.event.eventInfo.schedule}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Terms & Conditions:</span>{" "}
                  {selectedEvent.event.eventInfo.terms_and_conditions}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Social Links:</span>{" "}
                  <a
                    href={selectedEvent.event.eventInfo.social_links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {selectedEvent.event.eventInfo.social_links}
                  </a>
                </p>

                {/* Display images */}
                {selectedEvent.eventImages &&
                  selectedEvent.eventImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold mb-2">
                        Event Images
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {selectedEvent.eventImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.image_url}
                            alt={`Event Image ${idx + 1}`}
                            className="w-32 h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex justify-between">
                  <button
                    onClick={downloadStudents}
                    className="mt-6 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Get List of Registered Students
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="mt-6 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Event
                  </button>
                </div>
              </>
            )}

            {/* Confirmation Modal for Deletion */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-60">
                <div className="bg-white rounded-xl p-6 w-11/12 md:w-1/2 lg:w-1/3">
                  <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                  <p className="mb-4">
                    Are you sure you want to delete this event?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MemberEvents;
