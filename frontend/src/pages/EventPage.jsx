// EventsPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { loadRazorpayScript } from "../loadRazorpayScript"; // Adjust path as needed

const EventPage = () => {
  const { eventId } = useParams();
  const currentTime = new Date();

  const {
    eventsData,
    backendUrl,
    registrationDetails,
    userData,
    currency,
    navigate,
  } = useContext(AppContext);

  const [event, setEvent] = useState(null);
  const [fee, setFee] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [buttontext, setButtontext] = useState("");
  const [roll, setRoll] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("");

  const initPay = (order, registrationID) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,

      handler: async (response) => {
        //  / console.log(response);
        try {
          const payload = {
            ...response,
            eventID: eventId,
            registrationID,
          };

          const { data } = await axios.post(
            backendUrl + "/api/register/verify-razorpay",
            payload
          );
          if (data.success) {
            toast.success(data.message);
            toast.success("Please refresh!");

            navigate("/events/" + eventId);
          }
        } catch (error) {
          console.log(error);
          toast.error(error);
        }
      },

      prefill: {
        name: `${userData.name}`,
        email: userData.email,
        contact: contact,
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (failure) => {
      toast.error("Payment failed: " + failure.error.description);
    });
    rzp.open();
  };

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
    let registered = false;
    registrationDetails.forEach((element) => {
      if (element.userID == userData.userID && element.eventID == eventId) {
        registered = true;
      }
    });
    setIsRegistered(registered);
    setButtontext(registered ? "Already registered" : "Register Now");
  };

  const confirmClick = () => setShowDialog(true);
  const confirmClick2 = () => setShowDialog(true);

  // Registration Handler ----------------------------------------------------------------
  const RegisterHandler = async () => {
    axios.defaults.withCredentials = true;

    try {
      const response = await axios.post(
        `${backendUrl}/api/register/register-for-event`,
        {
          userID: userData.userID,
          eventID: eventId,
          fee,
          roll,
          contact,
          payment: method === "" ? null : method,
        }
      );
      // console.log("raw response:", response.data);
      const { success, session_url, message, order, registrationID } =
        response.data;
      if (!success) {
        toast.error(message);
        return;
      }

      if (session_url) {
        window.location.replace(session_url);
      } else if (order) {
        await loadRazorpayScript();
        initPay(order, registrationID);
      } else {
        // for the free event
        toast.success(message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setShowDialog(false);
    }
  };

  // Unregistration Handler ------------------------------------------------------------
  const UnregisterHandler = async () => {
    axios.defaults.withCredentials = true;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/register/unregister-for-event`,
        { eventID: eventId, fee }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      console.error("Error Unregistering from the event:", error);
      toast.error("Unregistration failed. Please try again.");
    } finally {
      setShowDialog(false);
      setTimeout(() => window.location.reload(), 2500);
    }
  };

  useEffect(() => {
    fetchEvent();
    userRegistrationDetails();
    // eslint-disable-next-line
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
              {new Date(event.event.eventInfo.start_date).toLocaleDateString()}
              {": "}
              {new Date(event.event.eventInfo.start_date).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )}{" "}
              -- {new Date(event.event.eventInfo.end_date).toLocaleDateString()}
              {": "}
              {new Date(event.event.eventInfo.end_date).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )}
            </p>

            <p className="mt-5 text-gray-500 md:w-4/5">
              {event.event.eventInfo.description}
            </p>

            <div className="flex flex-col gap-4 my-8">
              <p className="font-medium">Schedule</p>
              <p className="text-gray-500">{event.event.eventInfo.schedule}</p>
            </div>

            {userData && !userData.isAccountVerified ? (
              <div className="p-4 bg-pink-100 border-l-4 border-pink-500 w-[61%]">
                <p className="text-3xl">Verify your email address</p>
              </div>
            ) : userData && userData.accountType === "Student" ? (
              currentTime <
              new Date(event.event.eventInfo.registration_deadline) ? (
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
                          parseFloat(event.event.eventInfo.registration_fee) ===
                          0.0
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
                        : "hover:scale-110 transition-transform ease-in-out cursor-pointer duration-200 rounded-lg shadow-lg p-4 text-[15px] text-black cursor active:bg-[#d689e0] bg-[#E3CCE3] "
                    }`}
                  >
                    Unregister
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-pink-100 border-l-4 border-pink-500 w-[61%]">
                  <p className="text-3xl">
                    {currentTime > new Date(event.event.eventInfo.end_date)
                      ? "Event Concluded"
                      : "Registrations Closed"}
                  </p>
                </div>
              )
            ) : (
              <div className="p-4 bg-pink-100 border-l-4 border-pink-500 w-[61%]">
                <p className="text-3xl">Login as student to register</p>
              </div>
            )}

            <hr className="mt-8 sm:w-4/5" />
            <div className="text-sm text-gray-700 mt-5 flex flex-col gap-1">
              <p>Max Participants: {event.event.eventInfo.max_participants}</p>
              <p>Registered: {event.event.eventInfo.registered_students}</p>
              <p className="font-bold text-[17px]">
                Registration Deadline:{" "}
                {new Date(
                  event.event.eventInfo.registration_deadline
                ).toLocaleDateString()}{" "}
                at{" "}
                {new Date(
                  event.event.eventInfo.registration_deadline
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
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
          <div className="flex flex-col gap-4 border rounded-xl rounded-t-none border-gray-500 px-6 py-6 text-sm text-black mb-10">
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

      {/* Registration / Unregistration Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white relative rounded-xl shadow-xl p-6 w-11/12 max-w-md">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-3 right-3 text-red-500 font-bold cursor-pointer"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {buttontext === "Already registered"
                ? "Confirm Unregistration"
                : "Confirm Registration"}
            </h2>
            <p className="mb-6">
              {buttontext === "Already registered"
                ? "Are you sure you want to unregister from this event?"
                : "Are you sure you want to register for this event?"}
            </p>

            {/* Only show inputs when registering */}
            {buttontext !== "Already registered" && (
              <div className="mb-4 space-y-4">
                <div>
                  <label
                    htmlFor="roll"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Roll Number (College Only)
                  </label>
                  <input
                    type="text"
                    id="roll"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your Roll Number"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contact"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your contact no. (Preferably WhatsApp)"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>

                {/* Added Payment Method Selection */}
                {parseFloat(event.event.eventInfo.registration_fee) ===
                0.0 ? null : (
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">
                      Select Payment Method
                    </p>
                    <div className="flex gap-3 flex-col lg:flex-row">
                      <div
                        onClick={() => setMethod("stripe")}
                        className="flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer"
                      >
                        <p
                          className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${
                            method === "stripe" ? "bg-green-400" : ""
                          }`}
                        ></p>
                        <img
                          className="h-5 mx-4"
                          src={assets.stripe_logo}
                          alt="Stripe"
                        />
                      </div>
                      <div
                        onClick={() => setMethod("razorpay")}
                        className="flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer"
                      >
                        <p
                          className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${
                            method === "razorpay" ? "bg-green-400" : ""
                          }`}
                        ></p>
                        <img
                          className="h-5 mx-4"
                          src={assets.razorpay_logo}
                          alt="Razorpay"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dialog Actions */}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                onClick={
                  buttontext === "Already registered"
                    ? UnregisterHandler
                    : RegisterHandler
                }
                disabled={
                  buttontext !== "Already registered" &&
                  (!roll.trim() ||
                    !contact.trim() ||
                    (parseFloat(event.event.eventInfo.registration_fee) > 0 &&
                      !method))
                }
                className={`px-4 py-2 rounded-md text-black hover:bg-[#cd92cd] ${
                  buttontext === "Already registered" ||
                  (roll.trim() &&
                    contact.trim() &&
                    (parseFloat(event.event.eventInfo.registration_fee) === 0 ||
                      method))
                    ? "bg-[#E3CCE3] active:bg-[#d689e0] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
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
