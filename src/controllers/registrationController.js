import db from "../config/db.js";

// REGISTER FOR AN EVENT
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    // Check if event exists
    const [events] = await db.query(
      `SELECT id, title, event_date, capacity
       FROM events
       WHERE id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    // Prevent registration for past events
    if (new Date(event.event_date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event",
      });
    }

    // Check existing registration
    const [existing] = await db.query(
      `SELECT id, status
       FROM registrations
       WHERE user_id = ? AND event_id = ?`,
      [userId, eventId]
    );

    if (existing.length > 0) {
      if (existing[0].status === "registered") {
        return res.status(409).json({
          success: false,
          message: "You are already registered for this event",
        });
      }

      // User previously cancelled — reactivate registration
      const [registeredUsers] = await db.query(
        `SELECT COUNT(*) AS total
         FROM registrations
         WHERE event_id = ? AND status = 'registered'`,
        [eventId]
      );

      if (registeredUsers[0].total >= event.capacity) {
        return res.status(409).json({
          success: false,
          message: "This event has reached its maximum capacity",
        });
      }

      await db.query(
        `UPDATE registrations
         SET status = 'registered',
             registered_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [existing[0].id]
      );

      return res.status(200).json({
        success: true,
        message: "Event registration restored successfully",
      });
    }

    // Check event capacity
    const [registeredUsers] = await db.query(
      `SELECT COUNT(*) AS total
       FROM registrations
       WHERE event_id = ? AND status = 'registered'`,
      [eventId]
    );

    if (registeredUsers[0].total >= event.capacity) {
      return res.status(409).json({
        success: false,
        message: "This event has reached its maximum capacity",
      });
    }

    // Create registration
    const [result] = await db.query(
      `INSERT INTO registrations (user_id, event_id)
       VALUES (?, ?)`,
      [userId, eventId]
    );

    res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      data: {
        registrationId: result.insertId,
        event: {
          id: event.id,
          title: event.title,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// VIEW MY REGISTRATIONS
export const getMyRegistrations = async (req, res) => {
  try {
    const [registrations] = await db.query(
      `SELECT
          r.id AS registration_id,
          r.status,
          r.registered_at,
          e.id AS event_id,
          e.title,
          e.description,
          e.location,
          e.event_date
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: {
        registrations,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// CANCEL REGISTRATION
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [registrations] = await db.query(
      `SELECT id, status
       FROM registrations
       WHERE user_id = ? AND event_id = ?`,
      [req.user.id, eventId]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (registrations[0].status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Registration is already cancelled",
      });
    }

    await db.query(
      `UPDATE registrations
       SET status = 'cancelled'
       WHERE id = ?`,
      [registrations[0].id]
    );

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};