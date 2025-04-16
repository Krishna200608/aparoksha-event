import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { addCategory, addOrganiser, addSponsor, addVenue, createEvent, deleteCategory, deleteEvent, deleteOrganizer, deleteSponsor, deleteVenue, downloadRegisteredStudents, getCategories, getEvents, getOrganizers, getSponsors, getUpcomingEvents, getVenue, sendNotification } from '../controllers/eventController.js';
import upload from '../middleware/multer.js';



const eventRouter = express.Router();

//post routes
eventRouter.post('/create-event',upload.fields([{name:'image1',maxCount:1}, {name:'image2',maxCount:1}, {name:'image3',maxCount:1}, {name:'image4',maxCount:1}]),createEvent);
eventRouter.post('/add-venue', userAuth, addVenue);
eventRouter.post('/add-organiser', userAuth, addOrganiser);
eventRouter.post('/add-sponsor', userAuth, upload.fields([{name:'logo',maxCount:1}]) ,addSponsor);
eventRouter.post('/add-category' ,userAuth, addCategory);

// Delete Routes
eventRouter.post('/delete-event',userAuth ,deleteEvent);
eventRouter.post('/delete-venue', userAuth ,deleteVenue);
eventRouter.post('/delete-category',userAuth ,deleteCategory);
eventRouter.post('/delete-sponsor', userAuth,deleteSponsor);
eventRouter.post('/delete-organizer',userAuth,deleteOrganizer);
eventRouter.post('/get-upcoming-events',userAuth,getUpcomingEvents); // get upcoming events

// Get routes
eventRouter.get('/list', getEvents);
eventRouter.get('/categories', getCategories); // Categories
eventRouter.get('/venues', getVenue); // Venues
eventRouter.get('/organizers', getOrganizers); // Venues
eventRouter.get('/sponsors', getSponsors); // Sponsors
eventRouter.get('/download-students',userAuth, downloadRegisteredStudents)

// send notification
eventRouter.post('/send-notification', sendNotification)




export default eventRouter;