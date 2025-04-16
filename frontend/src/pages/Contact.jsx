import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import Footer from "../components/Footer";

const Contact = () => {
  const { navigate } = useContext(AppContext);
  return (
    <div className='min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      {/* Navbar at the top */}
      <Navbar />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-10">
        {/* Title Section */}
        <div className="text-center text-3xl pt-10 mt-20">
          <Title text1="CONTACT" text2="US" />
        </div>

        {/* Contact Info Section */}
        <div className="my-10 flex flex-col justify-center md:flex-row gap-10 items-center mt-15">
          <img
            className="w-full md:max-w-[600px] rounded-3xl object-cover mx-auto h-full"
            src={assets.contact_image}
            alt="Contact"
          />
          <div className="flex flex-col gap-6">
            <p className="font-semibold text-xl text-black">
              Event Management Office
            </p>
            <p className="text-gray-700">
              Admin Block (L-wing) <br /> Indian Institute of Information
              Technology Allahabad <br /> Prayagraj, U.P.
            </p>
            <p className="text-gray-700">
              Tel:{" "}
              <a href="tel:1234567890" className="hover:underline">
                (123) 456-7890
              </a>
              <br />
              <strong>
                Email:{" "}
                <a href="mailto:events@iiita.ac.in" className="hover:underline">
                  events@iiita.ac.in
                </a>
              </strong>
            </p>

            <div className="flex items-center justify-center gap-6 mt-10">
              <div className="flex flex-col justify-center gap-2">
                <p className="font-semibold text-xl text-black">
                  Volunteer Opportunities
                </p>
                <p className="text-gray-500 max-w-[350px]">
                  Join our team to help organize and manage our exciting campus
                  events.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
                >
                  Join as Member
                </button>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="font-semibold text-[18px] text-black">
                  View Upcoming Events
                </p>
                <p className="text-gray-500 max-w-[350px]">
                  Explore diverse events that spark creativity and ignite
                  curiosity.
                </p>
                <button
                  onClick={() => navigate("/events")}
                  className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
                >
                  Events
                </button>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Contact;
