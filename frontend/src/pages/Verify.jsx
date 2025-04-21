import React from 'react'
import { useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import {toast} from 'react-toastify';   
import axios from 'axios';
import { AppContext } from '../context/AppContext'

const Verify = () => {

    const {navigate, backendUrl } = useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams()

    const success = searchParams.get('success');
    let registrationID = searchParams.get('registrationID');
    registrationID = parseInt(registrationID,10);
    
    const eventID = searchParams.get('eventID')

    const verifyPayment = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/register/verify-stripe', {success, registrationID});

            if(response.data.success){
                toast.success('Registration successful for the event');
                navigate('/events/'+ eventID);
            } else {
                navigate('/events/'+ eventID);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        verifyPayment();
    },[success])

  return (
    <div>

    </div>
  )
}

export default Verify