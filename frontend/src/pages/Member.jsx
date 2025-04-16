// Member.jsx
import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { AppContext } from '../context/AppContext';
import Venue from '../components/Venue'; // Ensure the path is correct
import Organizer from '../components/Organizer';
import Sponsor from '../components/Sponsor';
import Category from '../components/Category';
import MemberEvents from '../components/MemberEvents';
import Footer from '../components/Footer';

const Member = () => {
  const { venues } = useContext(AppContext);
  const [expand, setExpand] = useState(true);
  const [activeView, setActiveView] = useState('events');

  return (
    <div className="flex flex-col min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Navbar />
      <div className="flex flex-1">
        {/* Pass activeView as a prop to Sidebar */}
        <Sidebar
          expand={expand}
          setExpand={setExpand}
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
        />
        <div className="flex-1 p-6">
          {activeView === 'events' && <MemberEvents />}
          {activeView === 'venue' && <Venue />}
          {activeView === 'organizer' && <Organizer />}
          {activeView === 'sponsor' && <Sponsor />}         
          {activeView === 'category' && <Category />}         
        </div>
      </div>
    </div>
  );
};

export default Member;
