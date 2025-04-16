import React, { useContext } from "react"; 
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import Footer from "../components/Footer";

const About = () => {
  const { navigate } = useContext(AppContext)

  return (
    <div className="min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center relative">
      <Navbar />
      <section className="py-24 relative">
        {/* First Div: General Event Management Content */}
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto mt-20">
          <div className="w-full justify-start items-center gap-8 grid lg:grid-cols-2 grid-cols-1">
            <div className="w-full flex-col justify-start lg:items-start items-center gap-10 inline-flex">
              <div className="w-full flex-col justify-start lg:items-start items-center gap-4 flex">
                <h2 className="text-gray-900 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                  Empowering College Communities through Exceptional Events
                </h2>
                <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                  Our event management platform is designed to create an engaging and inclusive environment. By bringing together diverse perspectives and talents, we ensure that every college event becomes a memorable experience that fosters personal growth and strengthens community bonds.
                </p>
              </div>
              <button onClick={()=>navigate('/')} className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded">
                Get Started
              </button>
            </div>
            <img
              className="lg:mx-0 mx-auto h-full rounded-3xl object-cover"
              src={assets.About1}
              alt="About Us"
            />
          </div>
        </div>

        {/* Second Div: Aparoksha Specific Content */}
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto mt-20">
          <div className="w-full justify-start items-center gap-8 grid lg:grid-cols-2 grid-cols-1">
            <img
              className="lg:mx-0 mx-auto h-full rounded-3xl object-cover"
              src={assets.About2} // Ensure this image exists in your assets folder
              alt="Aparoksha Technical Event"
            />
            <div className="w-full flex-col justify-start lg:items-start items-center gap-10 inline-flex">
              <div className="w-full flex-col justify-start lg:items-start items-center gap-4 flex">
                <h2 className="text-gray-900 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                  Experience Aparoksha: Where Innovation Meets Execution
                </h2>
                <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                  Join us at Aparoksha—the college's premier technical event—where creativity, collaboration, and technology converge. Explore hackathons, workshops, and inspirational talks designed to push your limits, spark innovation, and empower your technical journey.
                </p>
              </div>
              <button onClick={()=>navigate('/login')} className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded">
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default About;
