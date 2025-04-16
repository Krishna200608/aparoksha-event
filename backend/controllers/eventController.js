import { connectToDatabase } from "../lib/db.js";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import transporter from "../config/nodemailer.js";
import { EVENT_NOTIFICATION_TEMPLATE } from "../config/emailTemplates.js";
import schedule from 'node-schedule';

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

export const addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // Validate that the category name is provided.
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const db = await connectToDatabase();

    // Check if a category with the same name already exists.
    const [existingCategory] = await db.execute(
      "SELECT * FROM Category WHERE categoryName = ?",
      [categoryName]
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Insert the new category record.
    const [result] = await db.execute(
      "INSERT INTO Category (categoryName) VALUES (?)",
      [categoryName]
    );

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      categoryID: result.insertId,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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

// Getter Functions
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

export const getUpcomingEvents = async (req, res) => {
  const { events } = req.body;

  if (!events) {
    return res
      .status(400)
      .json({ success: false, message: "List of events required!" });
  }

  try {
    // Get the current time and calculate the limit date (current time + 10 days)
    const currentTime = new Date();
    const tenDaysLater = new Date(
      currentTime.getTime() + 10 * 24 * 60 * 60 * 1000
    );

    // Filter events whose start_date is within the next 10 days (and in the future)
    const upcomingEvents = events.filter((evt) => {
      // Extract the start_date from the event object and convert to Date
      const eventStartDate = new Date(evt.event.eventInfo.start_date);

      // Check if the event's start date is in the future AND within the next 10 days
      return eventStartDate >= currentTime && eventStartDate <= tenDaysLater;
    });

    // Return the filtered events
    return res.status(200).json({ success: true, upcomingEvents });
  } catch (error) {
    // Log the error if needed and send an error response
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// Delete functions
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
      message: "Event and all associated records deleted successfully.",
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

export const deleteVenue = async (req, res) => {
  const { venueID } = req.body;

  if (!venueID) {
    return res
      .status(400)
      .json({ success: false, message: "VenueID is required" });
  }

  let db; // declare db so we can use it in the catch block for rollback.

  try {
    db = await connectToDatabase();
    // Begin a transaction to ensure all related deletes are atomic.
    await db.beginTransaction();

    // Retrieve all eventIDs that are associated with the venue.
    const [events] = await db.execute(
      "SELECT eventID FROM Event WHERE venueID = ?",
      [venueID]
    );

    // Loop through each event and delete associated records.
    for (const event of events) {
      const { eventID } = event;

      // Delete from the child tables first to satisfy foreign key constraints.
      await db.execute("DELETE FROM EventImage WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM eventInfo WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM EventSponsor WHERE eventID = ?", [eventID]);

      // Optionally, delete registrations associated with the event.
      await db.execute("DELETE FROM Registration WHERE eventID = ?", [eventID]);

      // Finally, delete the event from the main Event table.
      await db.execute("DELETE FROM Event WHERE eventID = ?", [eventID]);
    }

    // Delete the venue record.
    await db.execute("DELETE FROM Venue WHERE venueID = ?", [venueID]);

    // Commit the transaction if all deletions were successful.
    await db.commit();

    return res.status(200).json({
      success: true,
      message: "Venue and all associated events deleted successfully.",
    });
  } catch (error) {
    // If an error occurs, rollback the transaction to maintain data integrity.
    if (db) {
      await db.rollback();
    }
    console.error("Error deleting venue:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting venue." });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryID } = req.body;

  if (!categoryID) {
    return res
      .status(400)
      .json({ success: false, message: "CategoryID is required" });
  }

  let db; // Declare db so we can use it in the catch block for rollback.

  try {
    db = await connectToDatabase();
    // Begin a transaction to ensure all related deletes are atomic.
    await db.beginTransaction();

    // Retrieve all eventIDs that are associated with the category.
    const [events] = await db.execute(
      "SELECT eventID FROM Event WHERE categoryID = ?",
      [categoryID]
    );

    // Loop through each event and delete associated records.
    for (const event of events) {
      const { eventID } = event;

      // Delete from the child tables first to satisfy foreign key constraints.
      await db.execute("DELETE FROM EventImage WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM eventInfo WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM EventSponsor WHERE eventID = ?", [eventID]);

      // Optionally, delete registrations associated with the event.
      await db.execute("DELETE FROM Registration WHERE eventID = ?", [eventID]);

      // Finally, delete the event from the main Event table.
      await db.execute("DELETE FROM Event WHERE eventID = ?", [eventID]);
    }

    // Delete the category record.
    await db.execute("DELETE FROM Category WHERE categoryID = ?", [categoryID]);

    // Commit the transaction if all deletions were successful.
    await db.commit();

    return res.status(200).json({
      success: true,
      message: "Category and all associated events deleted successfully.",
    });
  } catch (error) {
    // If an error occurs, rollback the transaction to maintain data integrity.
    if (db) {
      await db.rollback();
    }
    console.error("Error deleting category:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting category." });
  }
};

export const deleteSponsor = async (req, res) => {
  const { sponsorID } = req.body;

  if (!sponsorID) {
    return res
      .status(400)
      .json({ success: false, message: "SponsorID is required" });
  }

  let db; // Declare db to use it in the catch block for rollback.

  try {
    db = await connectToDatabase();
    // Begin a transaction to ensure all related deletes are atomic.
    await db.beginTransaction();

    // Delete associated entries in the EventSponsor table.
    await db.execute("DELETE FROM EventSponsor WHERE sponsorID = ?", [
      sponsorID,
    ]);

    // Delete the sponsor record.
    await db.execute("DELETE FROM Sponsor WHERE sponsorID = ?", [sponsorID]);

    // Commit the transaction if all deletions were successful.
    await db.commit();

    return res.status(200).json({
      success: true,
      message: "Sponsor and all associated event entries deleted successfully.",
    });
  } catch (error) {
    // Rollback the transaction in case of error.
    if (db) {
      await db.rollback();
    }
    console.error("Error deleting sponsor:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting sponsor." });
  }
};

export const deleteOrganizer = async (req, res) => {
  const { organizerID } = req.body;

  if (!organizerID) {
    return res
      .status(400)
      .json({ success: false, message: "OrganizerID is required" });
  }

  let db; // Declare db to use for transaction and rollback.

  try {
    db = await connectToDatabase();
    // Begin a transaction for atomic deletion.
    await db.beginTransaction();

    // Retrieve all eventIDs that are associated with this organizer from eventInfo.
    const [events] = await db.execute(
      "SELECT eventID FROM eventInfo WHERE organizerID = ?",
      [organizerID]
    );

    // Loop through each associated event and delete all related entries.
    for (const event of events) {
      const { eventID } = event;

      // Delete dependent records from child tables first.
      await db.execute("DELETE FROM EventImage WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM eventInfo WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM EventSponsor WHERE eventID = ?", [eventID]);
      await db.execute("DELETE FROM Registration WHERE eventID = ?", [eventID]);

      // Finally, delete the event record from the main Event table.
      await db.execute("DELETE FROM Event WHERE eventID = ?", [eventID]);
    }

    // Delete the organizer record itself.
    await db.execute("DELETE FROM Organizer WHERE organizerID = ?", [
      organizerID,
    ]);

    // Commit the transaction after all deletions are successful.
    await db.commit();

    return res.status(200).json({
      success: true,
      message: "Organizer and all associated events deleted successfully.",
    });
  } catch (error) {
    // Rollback the transaction if any error occurs.
    if (db) {
      await db.rollback();
    }
    console.error("Error deleting organizer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting organizer." });
  }
};

// Download Registered Students
export const downloadRegisteredStudents = async (req, res) => {
  const { eventID } = req.query;

  if (!eventID) {
    return res.status(400).json({
      success: false,
      message: "eventID is required to download the list of students",
    });
  }

  try {
    // Establish a connection to the database
    const db = await connectToDatabase();

    // Fetch registered students for the specified event.
    const [students] = await db.execute(
      `SELECT u.userID, u.name, u.email, r.contact, r.roll_no
       FROM Registration r
       JOIN User u ON r.userID = u.userID
       WHERE r.eventID = ?`,
      [eventID]
    );

    // Fetch event title for use as the header in the PDF.
    const [eventResult] = await db.execute(
      `SELECT title FROM Event WHERE eventID = ?`,
      [eventID]
    );
    const eventTitle = eventResult[0]?.title || "Event";

    // Set response headers to indicate a PDF file download.
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${eventTitle.replace(/\s+/g, "_")}_students.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Create a new PDF document.
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    // Pipe the PDF output to the response.
    doc.pipe(res);

    // ***** Add Page Border *****
    // Draw a rectangle as a page border within the margin.
    // Here, we use a slight inset from the margins to avoid clipping.
    const pageBorderInset = 10;
    doc
      .rect(
        doc.options.margin - pageBorderInset,
        doc.options.margin - pageBorderInset,
        doc.page.width - 2 * (doc.options.margin - pageBorderInset),
        doc.page.height - 2 * (doc.options.margin - pageBorderInset)
      )
      .stroke();

    // Add the event title and header text.
    doc
      .fontSize(18)
      .text(eventTitle, { align: "center" })
      .moveDown(0.5)
      .fontSize(16)
      .text("Participants list", { align: "center" })
      .moveDown(1);

    // Define column configuration. Adjust widths as needed.
    const startX = 50;
    const colSNWidth = 50; // Serial Number
    const colNameWidth = 150; // Name
    const colRollWidth = 100; // Roll Number
    const colContactWidth = 150; // Contact

    // Save current vertical position for header row.
    const headerY = doc.y;

    // Add table header with centered text for each column.
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("S.No", startX, headerY, { width: colSNWidth, align: "center" });
    doc.text("Name", startX + colSNWidth, headerY, { width: colNameWidth });
    doc.text("Roll Number", startX + colSNWidth + colNameWidth, headerY, {
      width: colRollWidth,
      align: "center",
    });
    doc.text(
      "Contact",
      startX + colSNWidth + colNameWidth + colRollWidth,
      headerY,
      { width: colContactWidth, align: "center" }
    );

    // Move down a little after header.
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(12);

    // Loop through the student records and add a row for each.
    students.forEach((student, index) => {
      // Use the index for serial number and center the text.
      const rowY = doc.y + 5; // slight vertical padding for the row

      doc.fontSize(12);
      doc.text(String(index + 1), startX, rowY, {
        width: colSNWidth,
        align: "center",
      });
      doc.text(student.name, startX + colSNWidth, rowY, {
        width: colNameWidth,
      });
      doc.text(
        String(student.roll_no),
        startX + colSNWidth + colNameWidth,
        rowY,
        { width: colRollWidth, align: "center" }
      );
      doc.text(
        student.contact,
        startX + colSNWidth + colNameWidth + colRollWidth,
        rowY,
        { width: colContactWidth, align: "center" }
      );
    });

    // Finalize the PDF and end the stream.
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while downloading registered students",
      error: error.message,
    });
  }
};


// Filter events that is going to be started in the next 30 mins

const sendNotificationTask = async () => {
  console.log('Running scheduled email notification check...');
  let db;
  
  try {
    // Connect to the database
    db = await connectToDatabase();

    // Define the SQL query to fetch events starting within the next hour
    const query = `
      SELECT  
        r.userID, 
        r.registrationID, 
        u.email, 
        e.title AS event_title, 
        ei.start_date, 
        ei.end_date, 
        v.name AS venue_name, 
        v.address AS venue_address
      FROM eventInfo AS ei
      JOIN Registration AS r 
          ON ei.eventID = r.eventID
      JOIN User AS u 
          ON r.userID = u.userID
      JOIN Event AS e 
          ON ei.eventID = e.eventID
      JOIN Venue AS v 
          ON e.venueID = v.venueID
      WHERE ei.start_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 HOUR)
        AND r.notification = 'not sent'
      ORDER BY ei.start_date ASC;
    `;

    // Execute the query
    const [events] = await db.query(query);

    // If no events are found, log and return
    if (!events || events.length === 0) {
      console.log('No upcoming events found requiring notification.');
      return;
    }

    console.log(`Found ${events.length} registrations requiring notification.`);

    // Iterate through each event record and send an email
    for (const event of events) {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: event.email,
        subject: `Exciting Reminder: Don't Miss "${event.event_title}"!`,
        html: EVENT_NOTIFICATION_TEMPLATE.replace(
          "{{event_title}}",
          event.event_title
        )
          .replace(
            "{{start_date}}",
            new Date(event.start_date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              hour12: true,
            })
          )
          .replace(
            "{{end_date}}",
            new Date(event.end_date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              hour12: true,
            })
          )
          .replace("{{venue_name}}", event.venue_name)
          .replace("{{venue_address}}", event.venue_address),
      };

      // Send the email using the configured transporter
      await transporter.sendMail(mailOptions);
      console.log(
        `Email sent to ${event.email} for event "${event.event_title}"`
      );

      // Update the registration record to mark the notification as sent
      const updateQuery = `
        UPDATE Registration
        SET notification = 'sent'
        WHERE registrationID = ?
      `;
      await db.query(updateQuery, [event.registrationID]);
      console.log(
        `Updated notification status to 'sent' for registrationID ${event.registrationID}`
      );
    }

    console.log('Email notification task completed successfully.');
  } catch (error) {
    console.error("Error in sendNotification task:", error);
  }
};

// Schedule the job to run every 15 minutes using node-schedule
// The rule '*/15 * * * *' means "every 15 minutes"
const job = schedule.scheduleJob('*/15 * * * *', async () => {
  try {
    await sendNotificationTask();
  } catch (error) {
    console.error('Error executing scheduled notification task:', error);
  }
});

console.log('Email notification scheduler started. Running every 15 minutes.');

export const sendNotification = async (req, res) => {
  try {
    await sendNotificationTask();
    return res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error in sendNotification controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
