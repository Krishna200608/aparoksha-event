import { connectToDatabase } from "../lib/db.js";

export const registerForEvent = async (req, res) => {
  const { userID, eventID, fee } = req.body;

  // Validate that both userID and eventID are provided.
  if (!userID || !eventID) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and Event ID are required" });
  }

  try {
    const db = await connectToDatabase();

    // Check if the user is already registered for the event.
    const [existingRegistration] = await db.execute(
      "SELECT * FROM Registration WHERE userID = ? AND eventID = ?",
      [userID, eventID]
    );

    if (existingRegistration.length > 0) {
      return res.json({
        success: false,
        message: "User already registered for this event",
      });
    }
    const status = fee === "0" ? "Free Event" : "pending";

    // Insert the registration record.
    await db.execute(
      "INSERT INTO Registration (userID, eventID, status) VALUES (?, ?, ?)",
      [userID, eventID, status]
    );

    await db.execute(
      "UPDATE eventInfo SET registered_students = registered_students + 1 WHERE eventID = ?",
      [eventID]
    );

    return res
      .status(201)
      .json({ success: true, message: "Event registration successful" });
  } catch (error) {
    console.error("Error registering for event:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unregisterEvent = async (req, res) => {
  const { userID, eventID } = req.body;

  // Validate request body
  if (!userID || !eventID) {
    return res
      .status(400)
      .json({ error: "Both userID and eventID are required." });
  }

  try {
    const db = await connectToDatabase();
    // Execute deletion from the Registration table where both userID and eventID match
    const [result] = await db.query(
      "DELETE FROM Registration WHERE userID = ? AND eventID = ?",
      [userID, eventID]
    );

    const [result1] = await db.query(
      "UPDATE eventInfo SET registered_students = registered_students - 1 WHERE eventID = ?",
      [eventID]
    );

    // Check if any record was deleted
    if (result.affectedRows === 0 || result1.affectedRows === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Registration not found for the given userID and eventID.",
        });
    }

    // Successful deletion response
    return res
      .status(200)
      .json({
        success: true,
        message: "Successfully unregistered from the event.",
      });
  } catch (error) {
    console.error("Error unregistering event:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error." });
  }
};

export const getRegistrationDetails = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [registration] = await db.execute(
      "SELECT registrationID, userID, eventID, status FROM Registration"
    );
    return res.status(200).json({ success: true, registration });
  } catch (error) {
    console.error("Error fetching registration details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
