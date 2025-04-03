import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/auth/is-auth"); // This checks if the user has a record or not in the database
            if (data.success) {
                setIsLoggedin(true);
                getUserData();
                getEventsData();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data");
            data.success ? setUserData(data.userData) : toast.error(data.message);
            //console.log(data.userData);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getEventsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/events/list');
            data.success ? setEvents(data.events) : toast.error(data.message);
            //console.log(data.events);
            //console.log(events);

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
        events
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
