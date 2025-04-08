import { connectToDatabase } from "../lib/db.js";
import { v2 as cloudinary } from "cloudinary";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      registration_deadline,
      venueID,
      organizerID,
      registration_fee,
      max_participants,
      prizes,
      video_preview_url,
      schedule,
      categoryID,
      terms_and_conditions,
      social_links,
      sponsorIDs, // Note: sponsorIDs will be a JSON string representing an array
    } = req.body;

    let imagesUrl = [];

    if (req.files) {
      const image1 = req.files.image1 && req.files.image1[0];
      const image2 = req.files.image2 && req.files.image2[0];
      const image3 = req.files.image3 && req.files.image3[0];
      const image4 = req.files.image4 && req.files.image4[0];

      const images = [image1, image2, image3, image4].filter(
        (item) => item !== undefined
      );

      if (images.length > 0) {
        imagesUrl = await Promise.all(
          images.map(async (item) => {
            try {
              let result = await cloudinary.uploader.upload(item.path, {
                resource_type: "image",
              });
              return result.secure_url;
            } catch (uploadError) {
              console.error(
                "Cloudinary upload failed for file:",
                item.path,
                uploadError
              );
              throw uploadError;
            }
          })
        );
      }
    }

    if (!title || !start_date) {
      return res.status(400).json({
        success: false,
        message: "Event title and start date are required",
      });
    }

    // Parse sponsorIDs from JSON string to an array. If parsing fails, default to an empty array.
    let sponsorIDsArray = [];
    if (sponsorIDs) {
      try {
        sponsorIDsArray = JSON.parse(sponsorIDs);
      } catch (parseError) {
        console.error("Error parsing sponsorIDs:", parseError);
        sponsorIDsArray = [];
      }
    }

    const db = await connectToDatabase();
    const [eventResult] = await db.execute(
      `INSERT INTO Event (title, categoryID, venueID) VALUES (?, ?, ?)`,
      [title, categoryID, venueID]
    );
    const eventID = eventResult.insertId;
    const primaryImageUrl = imagesUrl.length > 0 ? imagesUrl[0] : null;

    await db.execute(
      `INSERT INTO eventInfo (
           eventID,
           description,
           start_date,
           end_date,
           registration_deadline,
           organizerID,
           registration_fee,
           max_participants,
           prizes,
           image_url,
           video_preview_url,
           schedule,
           terms_and_conditions,
           social_links
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventID,
        description ?? null,
        start_date,
        end_date ?? null,
        registration_deadline ?? null,
        organizerID ?? null,
        registration_fee ?? 0,
        max_participants ?? null,
        prizes ?? null,
        primaryImageUrl,
        video_preview_url ?? null,
        schedule ?? null,
        terms_and_conditions ?? null,
        social_links ?? null,
      ]
    );

    for (const url of imagesUrl) {
      await db.execute(
        `INSERT INTO EventImage (eventID, image_url) VALUES (?, ?)`,
        [eventID, url]
      );
    }

    // Insert into EventSponsor table for each selected sponsor
    if (sponsorIDsArray.length > 0) {
      for (const sponsorID of sponsorIDsArray) {
        await db.execute(
          `INSERT INTO EventSponsor (eventID, sponsorID) VALUES (?, ?)`,
          [eventID, sponsorID]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event_id: eventID,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



//  Deleting the event
export const deleteEvent = async (req, res) => {
  // Destructure eventID from the request body (note: do not call req.body as a function)
  const { eventID } = req.body;

  if (!eventID) {
    return res
      .status(400)
      .json({ success: false, message: "EventID is required" });
  }

  try {
    const db = await connectToDatabase();
    // Start a transaction
    await db.beginTransaction();

    // Delete from child tables first to satisfy foreign key constraints
    await db.execute("DELETE FROM EventImage WHERE eventID = ?", [eventID]);
    await db.execute("DELETE FROM eventInfo WHERE eventID = ?", [eventID]);
    await db.execute("DELETE FROM EventSponsor WHERE eventID = ?", [eventID]);
    
    // Optionally, if there are registrations associated with the event, delete them too.
    await db.execute("DELETE FROM Registration WHERE eventID = ?", [eventID]);

    // Finally, delete the event from the main Event table
    await db.execute("DELETE FROM Event WHERE eventID = ?", [eventID]);

    // Commit the transaction if all deletions were successful
    await db.commit();

    return res.status(200).json({
      success: true,
      message: "Event and all associated records deleted successfully."
    });
  } catch (error) {
    // If any error occurs, rollback the transaction to maintain data integrity
    if (db) {
      await db.rollback();
    }
    console.error("Error deleting event:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting event." });
  }
};


export const getEvents = async (req, res) => {
  try {
    const db = await connectToDatabase();

    // 1. Get all events with their extended details (eventInfo), category, venue, and organizer.
    const [eventsData] = await db.execute(
      `SELECT 
          e.eventID, e.title, e.venueID, e.categoryID,
          c.categoryName,
          ei.description, ei.start_date, ei.end_date, ei.registration_deadline, 
          ei.registration_fee, ei.max_participants, ei.registered_students, 
          ei.image_url AS main_image,   -- Added to include main_image in response.
          ei.schedule, ei.terms_and_conditions, ei.social_links, 
          ei.created_at AS eventInfoCreated, ei.updated_at AS eventInfoUpdated,
          v.venueID, v.name AS venueName, v.address AS venueAddress,
          o.organizerID, o.name AS organizerName, o.contact AS organizerContact
       FROM Event e
       LEFT JOIN Category c ON e.categoryID = c.categoryID
       LEFT JOIN eventInfo ei ON e.eventID = ei.eventID
       LEFT JOIN Venue v ON e.venueID = v.venueID
       LEFT JOIN Organizer o ON ei.organizerID = o.organizerID
       ORDER BY ei.start_date ASC`
    );

    if (!eventsData.length) {
      return res.json({ success: true, events: [] });
    }

    // Get list of event IDs to fetch images and sponsors in one go.
    const eventIDs = eventsData.map((event) => event.eventID);

    // 2. Retrieve all event images for the fetched events.
    const [imagesData] = await db.query(
      `SELECT imageID, eventID, image_url, created_at 
       FROM EventImage
       WHERE eventID IN (${eventIDs.join(",")})`
    );

    // 3. Retrieve sponsors linked to the events.
    const [sponsorsData] = await db.query(
      `SELECT es.eventID, s.sponsorID, s.name, s.logo_url, s.description, s.created_at 
       FROM EventSponsor es
       JOIN Sponsor s ON es.sponsorID = s.sponsorID
       WHERE es.eventID IN (${eventIDs.join(",")})`
    );

    // 4. Combine the data into a single structure per event.
    const events = eventsData.map((event) => {
      // Get images for this event.
      const eventImages = imagesData.filter(
        (img) => img.eventID === event.eventID
      );

      // Get sponsors for this event.
      const sponsors = sponsorsData.filter(
        (sponsor) => sponsor.eventID === event.eventID
      );

      return {
        // Basic event details.
        event: {
          eventID: event.eventID,
          title: event.title,
          location: event.location,
          category: {
            categoryID: event.categoryID,
            categoryName: event.categoryName,
          },
          // Extended event info.
          eventInfo: {
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            registration_deadline: event.registration_deadline,
            registration_fee: event.registration_fee,
            max_participants: event.max_participants,
            registered_students: event.registered_students,
            waitlist_enabled: event.waitlist_enabled,
            prizes: event.prizes,
            main_image: event.main_image,
            video_preview_url: event.video_preview_url,
            schedule: event.schedule,
            terms_and_conditions: event.terms_and_conditions,
            social_links: event.social_links,
            created_at: event.eventInfoCreated,
            updated_at: event.eventInfoUpdated,
          },
          // Venue info.
          venue: {
            venueID: event.venueID,
            name: event.venueName,
            address: event.venueAddress,
          },
          // Organizer info.
          organizer: {
            organizerID: event.organizerID,
            name: event.organizerName,
            contact: event.organizerContact,
          },
        },
        // Array of images.
        eventImages,
        // Array of sponsors.
        sponsors,
      };
    });

    return res.json({ success: true, events });
  } catch (error) {
    console.error("Error retrieving events:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addVenue = async (req, res) => {
  try {
    const { name, address } = req.body;

    // Validate that the name is provided.
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Venue name is required",
      });
    }

    // Connect to the database.
    const db = await connectToDatabase();

    // Insert the venue record into the database.
    const [result] = await db.execute(
      `INSERT INTO Venue (name, address) VALUES (?, ?)`,
      [name, address || null]
    );

    // Return success with the generated venueID.
    return res.status(201).json({
      success: true,
      message: "Venue added successfully",
      venueID: result.insertId,
    });
  } catch (error) {
    console.error("Error adding venue:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addOrganiser = async (req, res) => {
  try {
    const { name, contact } = req.body;

    // Validate that the organizer name is provided.
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organizer name is required",
      });
    }

    const db = await connectToDatabase();

    // Check if an organizer with the same name already exists.
    const [existingOrganizer] = await db.execute(
      "SELECT * FROM Organizer WHERE name = ?",
      [name]
    );

    if (existingOrganizer.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Organizer already exists",
      });
    }

    // Insert the new organizer record.
    const [result] = await db.execute(
      "INSERT INTO Organizer (name, contact) VALUES (?, ?)",
      [name, contact || null]
    );

    return res.status(201).json({
      success: true,
      message: "Organizer added successfully",
      organizerID: result.insertId,
    });
  } catch (error) {
    console.error("Error adding organizer:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addSponsor = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and Description is required",
      });
    }

    if (!req.files || !req.files.logo) {
      return res.status(400).json({
        success: false,
        message: "Logo file is required.",
      });
    }

    const db = await connectToDatabase();

    // Check if a sponsor with the given name already exists
    const checkQuery = `SELECT * FROM Sponsor WHERE name = ?`;
    const [existingSponsor] = await db.execute(checkQuery, [name]);

    if (existingSponsor.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Sponsor name already exists.",
      });
    }

    const logoFile = req.files.logo[0];
    const result = await cloudinary.uploader.upload(logoFile.path, {
      resource_type: "image",
    });

    const logoUrl = result.secure_url;

    await db.execute(
      `
      INSERT INTO Sponsor (name, logo_url, description)
      VALUES (?, ?, ?)
    `,
      [name, logoUrl, description]
    );

    return res.status(201).json({
      success: true,
      message: "Sponsor added successfully.",
      name,
    });
  } catch (error) {
    console.error("Error adding sponsor:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [categories] = await db.execute(
      "SELECT categoryID, categoryName FROM Category"
    );
    return res.json({ success: true, categories });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getVenue = async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [venues] = await db.execute(
      "SELECT venueID, name, address FROM Venue"
    );
    return res.json({ success: true, venues });
  } catch (error) {
    console.error("Error retrieving venues:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganizers = async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [organizers] = await db.execute(
      "SELECT organizerID, name, contact FROM Organizer"
    );
    return res.json({ success: true, organizers });
  } catch (error) {
    console.error("Error retrieving organizers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSponsors = async (req, res) => {
  try {
    const db = await connectToDatabase();
    // Query to select only the needed columns
    const [sponsors] = await db.execute(
      "SELECT sponsorID, name, logo_url, description FROM Sponsor"
    );

    // Respond with the retrieved sponsors data
    res.status(200).json({ success: true, sponsors });
  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error retrieving sponsors:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
