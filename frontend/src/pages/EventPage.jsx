import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const EventPage = () => {
  const { eventId } = useParams();
  const { eventsData, backendUrl, registrationDetails, userData,currency } =
    useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [fee, setFee] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [buttontext, setButtontext] = useState("");

  const fetchEvent = () => {
    eventsData.forEach((evt) => {
      if (evt.event.eventID.toString() === eventId) {
        setEvent(evt);
        setMainImage(evt.event.eventInfo.main_image);
        setFee(evt.event.eventInfo.registration_fee);
      }
    });
  };

  const userRegistrationDetails = () => {
    let isRegistered = false;

    registrationDetails.forEach((element) => {
      if (element.userID == userData.userID && element.eventID == eventId) {
        // console.log(userData.userID);
        // console.log(eventId);
        isRegistered = true;
      }
    });

    if (isRegistered) {
      //console.log("hi");
      setButtontext("Already registered");
    } else {
      setButtontext("Register Now");
    }
  };

  const confirmClick = () => {
    setShowDialog(true);
  };

  const confirmClick2 = () => {
    setShowDialog(true);
  };

  const RegisterHandler = async () => {
    axios.defaults.withCredentials = true;
    try {
      const response = await axios.post(
        `${backendUrl}/api/register/register-for-event`,
        {
          eventID: eventId,
          fee: fee,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        // Optionally update local state or redirect user
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setShowDialog(false);

      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const UnregisterHandler = async () => {
    axios.defaults.withCredentials = true;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/register/unregister-for-event`,
        {
          eventID: eventId,
        }
      );

      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      console.error("Error Unregistering from the event:", error);
      toast.error("Unregistration failed. Please try again.");
    } finally {
      setShowDialog(false);

      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  useEffect(() => {
    fetchEvent();
    userRegistrationDetails();
  }, [eventId, eventsData, registrationDetails, userData]);

  if (!event) return <div className="opacity-0"></div>;

  return (
    <div className="min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Navbar />
      <div className="container mx-auto px-20 border-t-2 border-gray-300 pt-10 transition-opacity ease-in duration-500 opacity-100">
        {/*------------------ Event Data ------------------ */}
        <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row mt-25">
          {/* ------------------ Event Images ------------------*/}
          <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.78%] w-full">
              {event.eventImages.map((img, index) => (
                <img
                  key={index}
                  onClick={() => setMainImage(img.image_url)}
                  src={img.image_url}
                  className="w-24% sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                  alt={`Event thumbnail ${index}`}
                />
              ))}
            </div>
            <div className="w-full sm:w-[80%] p-3 bg-white">
              <img
                className="w-full h-auto rounded-md"
                src={mainImage}
                alt="Main Event"
              />
            </div>
          </div>

          {/* ------------------ Event Info -------------------------- */}
          <div className="flex-1">
            <h1 className="font-medium text-4xl mt-2">{event.event.title}</h1>
            <div className="flex items-center gap-1 mt-2">
              <p className="pl-2 text-gray-500">
                {event.event.category.categoryName}
              </p>
            </div>

            <p className="mt-5 text-lg font-medium">
              {new Date(event.event.eventInfo.start_date).toLocaleDateString()}{" "}
              - {new Date(event.event.eventInfo.end_date).toLocaleDateString()}
            </p>
            <p className="mt-5 text-gray-500 md:w-4/5">
              {event.event.eventInfo.description}
            </p>

            <div className="flex flex-col gap-4 my-8">
              <p className="font-medium">Schedule</p>
              <p className="text-gray-500">{event.event.eventInfo.schedule}</p>
            </div>

            <div className="flex flex-row items-center gap-5">
              <button
                onClick={
                  buttontext === "Already registered" ? null : confirmClick
                }
                disabled={buttontext === "Already registered"}
                className={`rounded-lg shadow-lg p-4 text-[15px] cursor-pointer
              ${
                buttontext === "Already registered"
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-[#E3CCE3] text-black active:bg-[#d689e0] hover:scale-110 transition-transform ease-in-out duration-200"
              }`}
              >
                {buttontext === "Already registered"
                  ? "Already Registered"
                  : `Register Now - ${
                      parseFloat(event.event.eventInfo.registration_fee) === 0.0
                        ? "Free"
                        : `${currency} ${event.event.eventInfo.registration_fee}`
                    }`}
              </button>

              <button
                onClick={
                  buttontext === "Already registered" ? confirmClick2 : null
                }
                disabled={buttontext !== "Already registered"}
                className={`${
                  buttontext !== "Already registered"
                    ? "hidden"
                    : "hover:scale-110 transition-transform ease-in-out duration-200 rounded-lg shadow-lg p-4 text-[15px] text-black cursor active:bg-[#d689e0] bg-[#E3CCE3] "
                }`}
              >
                Unregister
              </button>
            </div>

            <hr className="mt-8 sm:w-4/5" />
            <div className="text-sm text-gray-700 mt-5 flex flex-col gap-1">
              <p>Max Participants: {event.event.eventInfo.max_participants}</p>
              <p>Registered: {event.event.eventInfo.registered_students}</p>
              <p>
                Registration Deadline:{" "}
                {new Date(
                  event.event.eventInfo.registration_deadline
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* ----------------- Additional Event Details Section ---------------------------------- */}
        <div className="mt-20">
          <div className="flex">
            <p className="border rounded-xl rounded-r-none rounded-b-none border-gray-700 px-5 py-3 text-sm">
              Event Details
            </p>
            <p className="border rounded-xl rounded-l-none rounded-b-none border-gray-700 px-5 py-3 text-sm">
              Sponsors
            </p>
          </div>
          <div className="flex flex-col gap-4 border r rounded-xl rounded-t-none border-gray-500 px-6 py-6 text-sm text-black mb-10">
            <p>
              <strong>Venue: </strong>
              {event.event.venue.name}, {event.event.venue.address}
            </p>
            <p>
              <strong>Organizer:</strong> {event.event.organizer.name} -{" "}
              {event.event.organizer.contact}
            </p>
            <p>
              <strong>Terms:</strong>{" "}
              {event.event.eventInfo.terms_and_conditions}
            </p>
          </div>
        </div>

        {/* ----------------- Sponsors Logos Section ---------------------------------- */}

        {event.sponsors && event.sponsors.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-medium mb-4">Our Sponsors</h2>
            <div className="flex flex-row items-center justify-center gap-8">
              {event.sponsors.map((sponsor, index) => (
                <img
                  key={index}
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="h-30 object-contain"
                />
              ))}
            </div>
          </div>
        )}
      </div>


      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-11/12 max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {buttontext === "Already registered"
                ? "Confirm"
                : "Confirm Registration"}
            </h2>
            <p className="mb-6">
              {buttontext === "Already registered"
                ? "Are you sure you want to Unregister from this event"
                : "Are you sure you want to register for this event?"}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-[#E3CCE3] text-black hover:bg-[#cd92cd]"
                onClick={
                  buttontext === "Already registered"
                    ? UnregisterHandler
                    : RegisterHandler
                }
              >
                {buttontext === "Already registered"
                  ? "Yes, Unregister"
                  : "Yes, Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default EventPage;
