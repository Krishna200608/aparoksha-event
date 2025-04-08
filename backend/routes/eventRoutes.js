import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { addOrganiser, addSponsor, addVenue, createEvent, deleteEvent, getCategories, getEvents, getOrganizers, getSponsors, getVenue } from '../controllers/eventController.js';
import upload from '../middleware/multer.js';



const eventRouter = express.Router();

//post routes
eventRouter.post('/create-event',userAuth, upload.fields([{name:'image1',maxCount:1}, {name:'image2',maxCount:1}, {name:'image3',maxCount:1}, {name:'image4',maxCount:1}]),createEvent);
eventRouter.post('/add-venue', userAuth, addVenue);
eventRouter.post('/add-organiser', userAuth, addOrganiser);
eventRouter.post('/add-sponser', userAuth, upload.fields([{name:'logo',maxCount:1}]) ,addSponsor);

// Delete Routes
eventRouter.post('/delete-event', deleteEvent);


// Get routes
eventRouter.get('/list', userAuth, getEvents);
eventRouter.get('/categories', userAuth, getCategories); // Categories
eventRouter.get('/venues', userAuth, getVenue); // Venues
eventRouter.get('/organizers', userAuth, getOrganizers); // Venues
eventRouter.get('/sponsors', userAuth, getSponsors); // Sponsors



export default eventRouter;