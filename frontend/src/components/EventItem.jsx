import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const EventItem = ({ id, title, image, registrationFee, participants, maxParticipant }) => {
  const { currency } = useContext(AppContext);

  return (
    <Link
      className="text-gray-700 cursor-pointer"
      to={`/events/${id}`}
    >
      <div className="overflow-hidden bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition">
        <img
          className="hover:scale-110 transition-transform ease-in-out duration-200 w-full h-48 object-cover rounded"
          src={image}
          alt={title || 'Event image'}
        />
        <p className="pt-3 pb-1 text-base font-semibold truncate">{title}</p>
        <p className="text-sm font-medium">
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
