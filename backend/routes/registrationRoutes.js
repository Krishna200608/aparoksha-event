import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getRegistrationDetails, registerForEvent, unregisterEvent } from '../controllers/registraionController.js';

const registrationRouter = express.Router();

// Post
registrationRouter.post('/register-for-event', userAuth, registerForEvent);
registrationRouter.post('/unregister-for-event', userAuth, unregisterEvent);

//Get
registrationRouter.get('/registration-details', userAuth, getRegistrationDetails); // Registration

export default registrationRouter;
