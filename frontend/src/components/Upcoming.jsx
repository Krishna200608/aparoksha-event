import React, { useEffect, useState } from "react";
import Title from "./Title";
import EventItem from "./EventItem";

const Upcoming = ({ upcomingEvents }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Assume upcomingEvents is already filtered for the next ten days,
    // otherwise you might filter it here based on the event dates.
    setEvents(upcomingEvents.slice(0, 6));
  }, [upcomingEvents]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"UPCOMING"} text2={"EVENTS"} />
        <p className="w-3/4 m-auto text-xs sm:text:text-sm md:text-base text-black">
          Experience the thrill of innovation at Aparoksha—our flagship college
          technical event. Join us for cutting-edge workshops, inspiring
          lectures, and interactive demos designed to spark creativity and
          propel you into the forefront of technology.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-3xl font-semibold py-8">
          No Upcoming events in the next 10 days, check out{" "}
          <a href="./events" className="text-blue-500 underline">
            Events
          </a>{" "}
          Section
        </div>
      ) : (
        <div className="grid m-20 grid-col-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 gap-y-6">
          {events.map((item) => (
            <EventItem
              key={item.event.eventID}
              id={item.event.eventID}
              title={item.event.title}
              image={item.event.eventInfo.main_image}
              registrationFee={item.event.eventInfo.registration_fee}
              participants={item.event.eventInfo.registered_students}
              maxParticipant={item.event.eventInfo.max_participants}
              startDate={item.event.eventInfo.start_date}
              endDate={item.event.eventInfo.end_date}
            />
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <hr className="w-9/10 text-gray-500" />
      </div>
    </div>
  );
};

export default Upcoming;
