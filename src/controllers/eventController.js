import db from "../config/db.js";

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const {title, description, location, event_date, capacity,} = req.body;

    if (!title || !location || !event_date || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Title, location, event date and capacity are required",
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    const eventDate = new Date(event_date);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date",
      });
    }

    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    const [result] = await db.query(
      `INSERT INTO events
       (title, description, location, event_date, capacity, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description?.trim() || null,
        location.trim(),
        eventDate,
        Number(capacity),
        req.user.id,
      ]
    );

    const [events] = await db.query(
      `SELECT id, title, description, location, event_date,
              capacity, organizer_id, created_at
       FROM events
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        event: events[0],
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


// GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.event_date,
          e.capacity,
          e.organizer_id,
          u.name AS organizer_name,
          e.created_at
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       ORDER BY e.event_date ASC`
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: {
        events,
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


// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(
      `SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.event_date,
          e.capacity,
          e.organizer_id,
          u.name AS organizer_name,
          e.created_at
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        event: events[0],
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


// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    // Organizer can only manage their own event
    if (
      req.user.role !== "admin" &&
      event.organizer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    const { title, description, location, event_date, capacity, } = req.body;

    // Validate capacity if supplied
    if (
      capacity !== undefined &&
      (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    // Validate date if supplied
    if (event_date !== undefined) {
      const newDate = new Date(event_date);

      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date",
        });
      }

      if (newDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future",
        });
      }
    }

    // Don't allow capacity below current registrations
    if (capacity !== undefined) {
      const [registeredUsers] = await db.query(
        `SELECT COUNT(*) AS total
         FROM registrations
         WHERE event_id = ? AND status = 'registered'`,
        [id]
      );

      if (Number(capacity) < registeredUsers[0].total) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity cannot be lower than the number of registered attendees",
        });
      }
    }

    await db.query(
      `UPDATE events
       SET title = ?,
           description = ?,
           location = ?,
           event_date = ?,
           capacity = ?
       WHERE id = ?`,
      [
        title ?? event.title,
        description ?? event.description,
        location ?? event.location,
        event_date ? new Date(event_date) : event.event_date,
        capacity !== undefined ? Number(capacity) : event.capacity,
        id,
      ]
    );

    const [updatedEvents] = await db.query(
      `SELECT id, title, description, location,
              event_date, capacity, organizer_id, updated_at
       FROM events
       WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        event: updatedEvents[0],
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


// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(
      "SELECT id, organizer_id FROM events WHERE id = ?",
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    if (
      req.user.role !== "admin" &&
      event.organizer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    await db.query(
      "DELETE FROM events WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};