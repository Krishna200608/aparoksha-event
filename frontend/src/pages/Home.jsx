import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Upcoming from "../components/Upcoming";
import Footer from "../components/Footer";
import Features from "../components/Features";

const Home = () => {
  const { eventsData, backendUrl } = useContext(AppContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const getUpcomingEvents = async () => {
    axios.defaults.withCredentials = true;

    try {
      const {data} = await axios.post( backendUrl + "/api/events/get-upcoming-events", { events: eventsData } );
      data.success ? setUpcomingEvents(data.upcomingEvents) : toast.error(data.message);
      console.log(data.upcomingEvents);

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getUpcomingEvents();
  }, [eventsData]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Navbar />
      <Header />
      <Upcoming upcomingEvents={upcomingEvents} />
      <Features/>
      <Footer/>
    </div>
  );
};

export default Home;
