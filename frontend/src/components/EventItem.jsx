import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const EventItem = ({
  id,
  title,
  image,
  registrationFee,
  participants,
  maxParticipant,
  startDate,
  endDate
}) => {
  const { currency } = useContext(AppContext);
  const [timing, setTiming] = useState(null);

  const timingHandler = () => {
    const currentTime = new Date();
    if (currentTime < new Date(startDate)) {
      setTiming("upcoming");
    } else if (currentTime < new Date(endDate)) {
      setTiming("ongoing");
    } else {
      setTiming("concluded");
    }
  };

  useEffect(() => {
    timingHandler();
  }, [startDate, endDate]);

  // Determine the border color class based on the timing state
  const borderColorClass =
    timing === "upcoming"
      ? "border-green-500"    // Upcoming events - blue border
      : timing === "ongoing"
      ? "border-blue-500"   // Ongoing events - green border
      : timing === "concluded"
      ? "border-red-500"    // Concluded events - gray border
      : "border-transparent"; // Default in case timing is not set

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/events/${id}`}>
      <div
        className={`overflow-hidden bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition border-3 ${borderColorClass}`}
      >
        <img
          className="hover:scale-110 transition-transform ease-in-out duration-200 w-full h-48 object-cover rounded"
          src={image}
          alt={title || 'Event image'}
        />
        <p className="pt-3 pb-1 text-base font-semibold truncate">{title}</p>
        <p className={`text-sm ${registrationFee === "0.00" ? 'text-green-600' : null }  font-medium`}>
          {registrationFee === "0.00" ? '' : currency}
          {registrationFee === "0.00" ? 'Free' : registrationFee}
        </p>
        <p className="text-sm text-gray-500">
          {participants} participants : Limit {maxParticipant}
        </p>
      </div>
    </Link>
  );
};

export default EventItem;
