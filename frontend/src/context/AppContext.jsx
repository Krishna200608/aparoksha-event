import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const currency = 'Rs.'

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [eventsData, setEventsData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [registrationDetails, setRegistrationDetails] = useState([]);

    const navigate = useNavigate();

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/auth/is-auth"); // This checks if the user has a record or not in the database
            if (data.success) {
                setIsLoggedin(true);
                getUserData();
                getRegistrationDetails();
            }
                getEventsData();
                getCategories();
                getVenues();
                getOrganizers();
                getSponsors();
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data");
            data.success ? setUserData(data.userData) : console.log(data.message);
            //console.log(data.userData);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getEventsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/list');
            data.success ? setEventsData(data.events) : toast.error(data.message);
            //  console.log(data.events);
            //console.log(events);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getCategories = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/categories');
            data.success ? setCategories(data.categories) : toast.error(data.message);
            //console.log(data.categories);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getVenues = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/venues');
            data.success ? setVenues(data.venues) : toast.error(data.message);
            //console.log(data.venues);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getOrganizers = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/organizers');
            data.success ? setOrganizers(data.organizers) : toast.error(data.message);
            //console.log(data.organizers);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getSponsors = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/sponsors');
            data.success ? setSponsors(data.sponsors) : toast.error(data.message);
            //console.log(data.sponsors);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getRegistrationDetails = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/register/registration-details');
            data.success ? setRegistrationDetails(data.registration) : toast.error(data.message);
            //console.log(data.registration);

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        getAuthState();
    },[])

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        navigate,
        eventsData,
        currency,
        categories, organizers, venues, sponsors, registrationDetails
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
