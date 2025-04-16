import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Footer = () => {
  const { navigate } = useContext(AppContext);

  return (
    <div className="mx-10 px-4">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 mt-40 text-sm">
        <div>
          <img
            onClick={() => navigate("/")}
            src={assets.logo}
            className="mb-5 w-20 cursor-pointer"
            alt=""
          />
          <p className="w-full md:w-1/2 text-gray-600">
            Aparoksha brings together bright minds and tech enthusiasts for an
            immersive experience in innovation and creativity. Celebrate the
            spirit of technology with engaging workshops, insightful talks, and
            a vibrant community that pushes the boundaries of possibility.
          </p>
        </div>

        <div>
          <p
            className="text-xl font-medium mb-5 hover:underline cursor-pointer"
            onClick={() => navigate("/events")}
          >
            EVENTS
          </p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li
              onClick={() => navigate("/")}
              className="hover:underline cursor-pointer"
            >
              Home
            </li>
            <li
              onClick={() => navigate("/about")}
              className="hover:underline cursor-pointer"
            >
              About us
            </li>
            <li
              onClick={() => navigate("/contact")}
              className="hover:underline cursor-pointer"
            >
              Contact
            </li>
            <li
              onClick={() => navigate("/")}
              className="hover:underline cursor-pointer"
            >
              Privacy policy
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <a href="tel:+12124567890" className="hover:underline">
                +1-212-456-7890
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@foreveryou.com"
                className="hover:underline"
              >
                events@iiita.ac.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <hr className="mt-4" />
        <p className="py-5 text-sm text-center">
            &copy; Copyright 2025@ iiita.ac.in - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
