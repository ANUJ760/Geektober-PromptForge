import { EventEmitter } from 'events';

/**
 * Central Event Emitter / Notification Bus for real-time application events.
 * Provides targeted broadcasting to connected users and general event subscription.
 */
class NotificationBus extends EventEmitter {
  constructor() {
    super();
    // Allow unlimited listeners to avoid MaxListenersExceededWarning under load
    this.setMaxListeners(0);
  }

  /**
   * Broadcast an event payload to a specific user.
   * Emits both a user-scoped event ('user:<userId>') and a global 'broadcast' event.
   *
   * @param {string|import('mongoose').Types.ObjectId} userId - Target user ID
   * @param {{ event: string, data: Record<string, any> }} payload - Event name and associated data
   */
  broadcastToUser(userId, payload) {
    if (!userId || !payload) return;
    const stringUserId = userId.toString();
    const eventName = payload.event || 'message';
    const eventData = payload.data !== undefined ? payload.data : payload;

    this.emit('broadcast', {
      userId: stringUserId,
      event: eventName,
      data: eventData,
    });

    this.emit(`user:${stringUserId}`, {
      event: eventName,
      data: eventData,
    });
  }
}

const eventBus = new NotificationBus();

/**
 * Convenience helper to broadcast an event directly to a user.
 */
export const broadcastToUser = (userId, payload) => {
  eventBus.broadcastToUser(userId, payload);
};

export default eventBus;
