import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import { streamNotifications } from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/v1/notifications/stream - Authenticated SSE stream
router.get('/stream', verifyJWT, streamNotifications);

export default router;
