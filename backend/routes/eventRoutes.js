import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { createEvent, getEvents, registerForEvent } from '../controllers/eventController.js';


const eventRouter = express.Router();

eventRouter.post('/create-event', userAuth, createEvent);
eventRouter.post('/register-for-event', userAuth, registerForEvent);

eventRouter.get('/list', userAuth, getEvents);



export default eventRouter;