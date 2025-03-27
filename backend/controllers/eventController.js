import { connectToDatabase } from '../lib/db.js';

export const createEvent = async (req, res) => {
    const { title, description, event_date, registration_fee, prizes } = req.body;

    // Basic validation: ensure title and event_date are provided
    if (!title || !event_date) {
        return res.status(400).json({ success: false, message: "Event title and date are required" });
    }

    try {
        // Connect to the database
        const db = await connectToDatabase();

        // SQL query to insert event data into the events table
        const [result] = await db.execute(
            "INSERT INTO events (title, description, event_date, registration_fee, prizes) VALUES (?, ?, ?, ?, ?)",
            [title, description, event_date, registration_fee || 0, prizes]
        );

        // Return success response with the inserted event's ID
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
  const { user_id, event_id } = req.body;

 // console.log(user_id, event_id);

  // Validate that both user_id and event_id are provided
  if (!user_id || !event_id) {
    return res.status(400).json({ success: false, message: "User ID and Event ID are required" });
  }

  try {
    const db = await connectToDatabase();

    // Check if the student is already registered for the event
    const [existingRegistration] = await db.execute(
      "SELECT * FROM registrations WHERE user_id = ? AND event_id = ?",
      [user_id, event_id]
    );

    if (existingRegistration.length > 0) {
      return res.json({ success: false, message: "User already registered for this event" });
    }

    // Insert the registration record into the database
    await db.execute(
      "INSERT INTO registrations (user_id, event_id) VALUES (?, ?)",
      [user_id, event_id]
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
    // Retrieve all events, sorted by event_date ascending
    const [events] = await db.execute("SELECT * FROM events ORDER BY event_date ASC");

    return res.json({ success: true, events });
  } catch (error) {
    console.error("Error retrieving events:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

