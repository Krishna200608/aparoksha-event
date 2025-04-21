import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getRegistrationDetails, registerForEvent, unregisterEvent, verifyRazorpay, verifyStripe } from '../controllers/registraionController.js';

const registrationRouter = express.Router();

// Post
registrationRouter.post('/register-for-event',userAuth, registerForEvent);
registrationRouter.post('/unregister-for-event', userAuth, unregisterEvent);

// Verify the Strip
registrationRouter.post('/verify-stripe', userAuth, verifyStripe);
registrationRouter.post('/verify-razorpay', userAuth, verifyRazorpay);



//Get
registrationRouter.get('/registration-details', getRegistrationDetails); // Registration

export default registrationRouter;
