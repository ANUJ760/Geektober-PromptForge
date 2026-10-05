import express from 'express';
import * as prompts from '../controllers/promptController.js';
import verifyJWT, { optionalAuth } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Cache trending prompts for 300 seconds
router.get('/trending', cacheMiddleware(300, 'trending'), prompts.getTrendingPrompts);
router.get('/all', optionalAuth, cacheMiddleware(60, 'catalog'), prompts.getAllPrompts);
router.get('/', optionalAuth, cacheMiddleware(60, 'catalog'), prompts.getAllPrompts);
router.get('/getProfilePrompts', verifyJWT, prompts.getProfilePrompts);
router.get('/:id', optionalAuth, prompts.getPromptById);
router.post('/create', verifyJWT, upload.single('image'), prompts.createPrompt);
router.post('/', verifyJWT, upload.single('image'), prompts.createPrompt);

export default router;
