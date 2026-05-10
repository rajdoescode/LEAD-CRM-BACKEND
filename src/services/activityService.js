import Activity from '../models/Activity.js';

/**
 * Logs an activity event to the database.
 * Used by controllers to record audit trail events.
 */
const logActivity = async ({ type, description, lead, user, metadata = {} }) => {
  try {
    await Activity.create({
      type,
      description,
      lead: lead || undefined,
      user: user || undefined,
      metadata,
    });
  } catch (err) {
    // Don't let activity logging failures break the main flow
    console.error('Activity log error:', err.message);
  }
};

export { logActivity };
