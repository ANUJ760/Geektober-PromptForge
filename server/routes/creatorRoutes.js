import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import * as creatorController from '../controllers/creatorController.js';

const router = express.Router();

router.get('/analytics', verifyJWT, creatorController.getCreatorAnalytics);

export default router;
