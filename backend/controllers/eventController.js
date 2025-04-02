import { connectToDatabase } from '../lib/db.js';

export const createEvent = async (req, res) => {
    const { title, description, event_date, registration_fee, prizes, location } = req.body;

    // Basic validation: ensure title and event_date are provided
    if (!title || !event_date) {
        return res.status(400).json({ success: false, message: "Event title and date are required" });
    }

    try {
        const db = await connectToDatabase();

        // Insert event data into the Event table
        // Note: 'date' column is used instead of event_date, and 'location' can be added if available.
        const [result] = await db.execute(
            `INSERT INTO Event (title, description, date, location, registration_fee, prizes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, event_date, location || null, registration_fee || 0, prizes]
        );

        // Return success response with the inserted event's ID (eventID)
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

    // Validate that both userID and eventID are provided
    if (!userID || !eventID) {
        return res.status(400).json({ success: false, message: "User ID and Event ID are required" });
    }

    try {
        const db = await connectToDatabase();

        // Check if the user is already registered for the event in the Registration table
        const [existingRegistration] = await db.execute(
            "SELECT * FROM Registration WHERE userID = ? AND eventID = ?",
            [userID, eventID]
        );

        if (existingRegistration.length > 0) {
            return res.json({ success: false, message: "User already registered for this event" });
        }

        // Insert the registration record into the Registration table
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
        // Retrieve all events, sorted by the new 'date' column in ascending order
        const [events] = await db.execute("SELECT * FROM Event ORDER BY date ASC");

        return res.json({ success: true, events });
    } catch (error) {
        console.error("Error retrieving events:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};