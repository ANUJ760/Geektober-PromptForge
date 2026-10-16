import eventBus from '../utils/eventBus.js';

// In-memory registry mapping userId (string) -> Set<res>
const clients = new Map();

// Helper to format Server-Sent Event frame
export function formatSSE(event, data) {
  if (event) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  }
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Global listener for targeted user broadcasts via eventBus
eventBus.on('broadcast', ({ userId, event, data }) => {
  if (!userId) return;
  const userClients = clients.get(userId.toString());
  if (userClients && userClients.size > 0) {
    const message = formatSSE(event, data);
    for (const clientRes of userClients) {
      try {
        clientRes.write(message);
        if (typeof clientRes.flush === 'function') {
          clientRes.flush();
        }
      } catch (err) {
        console.error(`Failed to write SSE to client for user ${userId}:`, err);
      }
    }
  }
});

/**
 * SSE Stream endpoint handler: GET /api/v1/notifications/stream
 * Protected by verifyJWT auth middleware.
 */
export function streamNotifications(req, res) {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing from session' });
  }

  const stringUserId = userId.toString();

  // Set HTTP headers for SSE streaming
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Register client in the in-memory map
  if (!clients.has(stringUserId)) {
    clients.set(stringUserId, new Set());
  }
  clients.get(stringUserId).add(res);

  // Send initial connection confirmation
  res.write(
    formatSSE('connected', {
      status: 'connected',
      userId: stringUserId,
      timestamp: new Date().toISOString(),
    })
  );

  // 25-second heartbeat ping to keep connection alive through proxies/Render
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
      res.write(
        formatSSE('ping', {
          timestamp: Date.now(),
        })
      );
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 25000);

  // Clean up client registry on disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    const userClients = clients.get(stringUserId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        clients.delete(stringUserId);
      }
    }
    res.end();
  });
}

/**
 * Inspection helper for testing and health monitoring
 */
export function getConnectedClientsCount(userId = null) {
  if (userId) {
    return clients.get(userId.toString())?.size || 0;
  }
  let total = 0;
  for (const set of clients.values()) {
    total += set.size;
  }
  return total;
}

/**
 * Reset registry for testing environments
 */
export function resetClientRegistry() {
  clients.clear();
}
