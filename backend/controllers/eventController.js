import { connectToDatabase } from '../lib/db.js';

export const createEvent = async (req, res) => {
  const {
    title,
    description,
    start_date,
    end_date,
    registration_deadline,
    location,
    venueID,
    organizerID,
    registration_fee,
    max_participants,
    prizes,
    image_url,
    video_preview_url,
    schedule,
    terms_and_conditions,
    social_links,
    latitude,         // New: Latitude coordinate
    longitude         // New: Longitude coordinate
  } = req.body;

  // Basic validation: ensure title and start_date are provided.
  if (!title || !start_date) {
    return res.status(400).json({ success: false, message: "Event title and start date are required" });
  }

  try {
    const db = await connectToDatabase();

    // If latitude and longitude are provided, convert them into a POINT value.
    // MySQL's ST_GeomFromText function is used to convert a WKT string into a geometry.
    let pointWKT = null;
    if (latitude && longitude) {
      pointWKT = `POINT(${latitude} ${longitude})`;
    }

    // Insert event data into the Event table.
    // The new schema uses columns such as start_date, end_date, registration_deadline,
    // venueID, organizerID, max_participants, image_url, video_preview_url, schedule,
    // terms_and_conditions, social_links, and location_coordinates.
    const [result] = await db.execute(
      `INSERT INTO Event (
         title,
         description,
         start_date,
         end_date,
         registration_deadline,
         location,
         venueID,
         organizerID,
         registration_fee,
         max_participants,
         prizes,
         image_url,
         video_preview_url,
         schedule,
         terms_and_conditions,
         social_links,
         location_coordinates
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?))`,
      [
        title,
        description || null,
        start_date,
        end_date || null,
        registration_deadline || null,
        location || null,
        venueID || null,
        organizerID || null,
        registration_fee || 0,
        max_participants || null,
        prizes || null,
        image_url || null,
        video_preview_url || null,
        schedule || null,
        terms_and_conditions || null,
        social_links || null,
        pointWKT
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event_id: result.insertId
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  const { userID, eventID } = req.body;

  // Validate that both userID and eventID are provided.
  if (!userID || !eventID) {
    return res.status(400).json({ success: false, message: "User ID and Event ID are required" });
  }

  try {
    const db = await connectToDatabase();

    // Check if the user is already registered for the event.
    const [existingRegistration] = await db.execute(
      "SELECT * FROM Registration WHERE userID = ? AND eventID = ?",
      [userID, eventID]
    );

    if (existingRegistration.length > 0) {
      return res.json({ success: false, message: "User already registered for this event" });
    }

    // Insert the registration record.
    await db.execute(
      "INSERT INTO Registration (userID, eventID) VALUES (?, ?)",
      [userID, eventID]
    );

    return res.status(201).json({ success: true, message: "Event registration successful" });
  } catch (error) {
    console.error("Error registering for event:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const db = await connectToDatabase();
    // Retrieve all events, sorted by start_date in ascending order.
    const [events] = await db.execute("SELECT * FROM Event ORDER BY start_date ASC");

    return res.json({ success: true, events });
  } catch (error) {
    console.error("Error retrieving events:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
