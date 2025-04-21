import { connectToDatabase } from "../lib/db.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";
import {
  EVENT_NOTIFICATION_TEMPLATE,
  REGISTRATION_COMPLETE,
} from "../config/emailTemplates.js";

//gateway initialisation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CURRENCY = process.env.CURRENCY || "INR";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const registerForEvent = async (req, res) => {
  const { userID, eventID, fee, roll, contact, payment } = req.body;

  if (!userID || !eventID || !roll) {
    return res.status(400).json({
      success: false,
      message: "User ID, Event ID and Roll Number are required",
    });
  }

  try {
    const db = await connectToDatabase();

    // 1. Prevent duplicate registrations
    const [existingRows] = await db.execute(
      "SELECT * FROM Registration WHERE userID = ? AND eventID = ?",
      [userID, eventID]
    );
    if (existingRows.length > 0) {
      return res.json({
        success: false,
        message: "User already registered for this event",
      });
    }

    // 2. Determine initial status
    const status = parseFloat(fee) === 0 ? "Free Event" : "pending";

    // 3. Insert the registration record
    const [insertResult] = await db.execute(
      `INSERT INTO Registration
         (userID, eventID, status, roll_no, contact, notification)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userID, eventID, status, roll, contact, "not sent"]
    );
    const registrationID = insertResult.insertId;

    // 4) Fetch start/end dates **and times** from the DB
    const [[eventInfo]] = await db.execute(
      `
    SELECT
      e.title                                 AS eventTitle,
      v.name                                  AS venueName,
      v.address                               AS venueAddress,
      DATE_FORMAT(i.start_date, '%Y-%m-%d')   AS startDate,
      DATE_FORMAT(i.start_date, '%H:%i')      AS startTime,
      DATE_FORMAT(i.end_date,   '%Y-%m-%d')   AS endDate,
      DATE_FORMAT(i.end_date,   '%H:%i')      AS endTime
    FROM eventInfo  AS i
    INNER JOIN \`Event\`   AS e  ON i.eventID  = e.eventID
    INNER JOIN Venue       AS v  ON e.venueID  = v.venueID
    WHERE i.eventID = ?
  `,
      [eventID]
    );

    const [[userInfo]] = await db.execute(
      `SELECT email FROM User WHERE userID = ?`,
      [userID]
    );

    // 5. If it's free, bump counter, send email & return
    if (parseFloat(fee) === 0) {
      await db.execute(
        "UPDATE eventInfo SET registered_students = registered_students + 1 WHERE eventID = ?",
        [eventID]
      );

      // Prepare and send confirmation email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: userInfo.email,
        subject: `Registration Successful: ${eventInfo.eventTitle}`,
        html: REGISTRATION_COMPLETE.replace(
          "{{event_title}}",
          eventInfo.eventTitle
        )
          .replace("{{start_date}}", eventInfo.startDate)
          .replace("{{start_time}}", eventInfo.startTime)
          .replace("{{end_date}}", eventInfo.endDate)
          .replace("{{end_time}}", eventInfo.endTime)
          .replace("{{venue_name}}", eventInfo.venueName)
          .replace("{{venue_address}}", eventInfo.venueAddress),
      };
      await transporter.sendMail(mailOptions);

      console.log(
        `Registration successful for "${eventInfo.eventTitle}" (Free Event). Confirmation email sent to ${userInfo.email}`
      );

      return res.status(201).json({
        success: true,
        message: `Registration successful for "${eventInfo.eventTitle}" (Free Event). Confirmation email sent to ${userInfo.email}`,
      });
    }

    // ————————————— Stripe Flow —————————————
    if (payment === "stripe") {
      const { origin } = req.headers;
      const line_items = [
        {
          price_data: {
            currency: CURRENCY.toLowerCase(),
            product_data: { name: `Registration: ${eventInfo.eventTitle}` },
            unit_amount: Math.round(parseFloat(fee) * 100),
          },
          quantity: 1,
        },
      ];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${origin}/verify?success=true&registrationID=${registrationID}&eventID=${eventID}`,
        cancel_url: `${origin}/verify?success=false&registrationID=${registrationID}&eventID=${eventID}`,
        metadata: { registrationID, userID, eventID },
      });

      return res.json({ success: true, session_url: session.url });
    }

    // ———————————— Razorpay Flow ————————————
    if (payment === "razorpay") {
      const options = {
        amount: Math.round(parseFloat(fee) * 100),
        currency: CURRENCY.toUpperCase(),
        receipt: registrationID.toString(),
        notes: {
          userID: userID.toString(),
          eventID: eventID.toString(),
        },
      };

      try {
        const order = await razorpayInstance.orders.create(options);

        return res.status(201).json({
          success: true,
          order,
          registrationID,
          message: `Order created for "${eventInfo.eventTitle}"`,
        });
      } catch (err) {
        console.error("Razorpay error:", err);
        const statusCode = err.statusCode || 500;
        const msg = err.description || err.error || err.message;
        return res.status(statusCode).json({
          success: false,
          message: msg,
        });
      }
    }

    // ——————————— Fallback ———————————
    return res
      .status(400)
      .json({ success: false, message: "Invalid payment method" });
  } catch (error) {
    console.error("Error registering for event:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyStripe = async (req, res) => {
  // 1) Destructure and validate all four inputs:
  const { registrationID, eventID, userID, success } = req.body;
  if (
    !registrationID ||
    !eventID ||
    !userID ||
    typeof success === "undefined"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "registrationID, eventID, userID and success flag are all required",
    });
  }

  try {
    const db = await connectToDatabase();

    // Treat either boolean true or string "true" as success
    if (success === true || success === "true") {
      // 2) Mark the registration as paid
      await db.execute(
        `
          UPDATE Registration
             SET status = ?,
                 payment_method = ?
           WHERE registrationID = ?
        `,
        ["paid", "Stripe", registrationID]
      );

      // 3) Pull event + venue details (uses i.venueID)
      const [[eventInfo]] = await db.execute(
        `
          SELECT
            e.title                           AS eventTitle,
            v.name                            AS venueName,
            v.address                         AS venueAddress,
            DATE_FORMAT(i.start_date, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(i.start_date, '%H:%i')   AS startTime,
            DATE_FORMAT(i.end_date,   '%Y-%m-%d') AS endDate,
            DATE_FORMAT(i.end_date,   '%H:%i')   AS endTime
          FROM eventInfo AS i
          INNER JOIN \`Event\` AS e  ON i.eventID  = e.eventID
          INNER JOIN Venue     AS v  ON e.venueID  = v.venueID
          WHERE i.eventID = ?
        `,
        [eventID]
      );

      // 4) Fetch the user’s email
      const [[userInfo]] = await db.execute(
        `SELECT email FROM User WHERE userID = ?`,
        [userID]
      );

      // 5) Increment registered_students
      await db.execute(
        `
          UPDATE eventInfo AS ei
          INNER JOIN Registration AS r
            ON r.eventID = ei.eventID
          SET ei.registered_students = ei.registered_students + 1
          WHERE r.registrationID = ?
        `,
        [registrationID]
      );

      // 6) Build and send the confirmation email
      const htmlBody = REGISTRATION_COMPLETE
        .replace("{{event_title}}", eventInfo.eventTitle)
        .replace("{{start_date}}", eventInfo.startDate)
        .replace("{{start_time}}", eventInfo.startTime)
        .replace("{{end_date}}", eventInfo.endDate)
        .replace("{{end_time}}", eventInfo.endTime)
        .replace("{{venue_name}}", eventInfo.venueName)
        .replace("{{venue_address}}", eventInfo.venueAddress);

      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: userInfo.email,
        subject: `Registration Successful: ${eventInfo.eventTitle}`,
        html: htmlBody,
      });

      return res.status(200).json({
        success: true,
        message: `Payment verified, registration updated, and confirmation email sent to ${userInfo.email}.`,
      });
    } else {
      // Payment failed → remove the registration record
      await db.execute(
        `
          DELETE FROM Registration
           WHERE registrationID = ?
        `,
        [registrationID]
      );

      return res.json({
        success: false,
        message: "Payment failed; registration removed.",
      });
    }
  } catch (error) {
    console.error("Error in verifyStripe:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRazorpay = async (req, res) => {
  const {
    registrationID,
    eventID,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userID,
  } = req.body;

  // 1) Validate required params
  if (
    !registrationID ||
    !eventID ||
    !userID ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
      message:
        "registrationID, eventID, userID, razorpay_order_id, razorpay_payment_id and razorpay_signature are all required",
    });
  }

  // 2) Verify signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed (invalid signature)",
    });
  }

  try {
    const db = await connectToDatabase();

    // 3) Double‑check on Razorpay’s end
    const orderInfo = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );
    if (orderInfo.status !== "paid") {
      // remove registration if not paid
      await db.execute(
        `DELETE FROM Registration WHERE registrationID = ?`,
        [registrationID]
      );
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // 4) Mark registration paid
    await db.execute(
      `
        UPDATE Registration
          SET status = ?, payment_method = ?
        WHERE registrationID = ?
      `,
      ["paid", "razorpay", registrationID]
    );

    // 5) Increment attendee count
    await db.execute(
      `
        UPDATE eventInfo
           SET registered_students = registered_students + 1
         WHERE eventID = ?
      `,
      [eventID]
    );

    // 6) Fetch event + venue details
    const [[eventInfo]] = await db.execute(
      `
        SELECT
          e.title                             AS eventTitle,
          v.name                              AS venueName,
          v.address                           AS venueAddress,
          DATE_FORMAT(i.start_date, '%Y-%m-%d') AS startDate,
          DATE_FORMAT(i.start_date, '%H:%i')   AS startTime,
          DATE_FORMAT(i.end_date,   '%Y-%m-%d') AS endDate,
          DATE_FORMAT(i.end_date,   '%H:%i')   AS endTime
        FROM eventInfo AS i
        INNER JOIN \`Event\`   AS e  ON i.eventID  = e.eventID
        INNER JOIN Venue       AS v  ON e.venueID  = v.venueID
        WHERE i.eventID = ?
      `,
      [eventID]
    );

    // 7) Fetch user email
    const [[userInfo]] = await db.execute(
      `SELECT email FROM User WHERE userID = ?`,
      [userID]
    );

    // 8) Build and send confirmation email
    const htmlBody = REGISTRATION_COMPLETE
      .replace("{{event_title}}", eventInfo.eventTitle)
      .replace("{{start_date}}", eventInfo.startDate)
      .replace("{{start_time}}", eventInfo.startTime)
      .replace("{{end_date}}", eventInfo.endDate)
      .replace("{{end_time}}", eventInfo.endTime)
      .replace("{{venue_name}}", eventInfo.venueName)
      .replace("{{venue_address}}", eventInfo.venueAddress);

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: userInfo.email,
      subject: `Registration Successful: ${eventInfo.eventTitle}`,
      html: htmlBody,
    });

    // 9) Respond
    return res.status(201).json({
      success: true,
      message: `Registration successful for "${eventInfo.eventTitle}". Confirmation email sent to ${userInfo.email}`,
    });
  } catch (error) {
    console.error("Error in verifyRazorpay:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const unregisterEvent = async (req, res) => {
  const { userID, eventID, fee } = req.body;

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
      return res.status(404).json({
        success: false,
        message: "Registration not found for the given userID and eventID.",
      });
    }

    if (fee === "0.00") {
      return res.status(200).json({
        success: true,
        message: "Successfully unregistered from the event.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message:
          "Successfully unregistered from the event. Payment will be returned shortly.",
      });
    }
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
