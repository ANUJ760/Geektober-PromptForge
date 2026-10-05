import express from 'express';
import * as prompts from '../controllers/promptController.js';
import verifyJWT, { optionalAuth } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.get('/trending', prompts.getTrendingPrompts);
router.get('/all', optionalAuth, prompts.getAllPrompts);
router.get('/', optionalAuth, prompts.getAllPrompts);
router.get('/getProfilePrompts', verifyJWT, prompts.getProfilePrompts);
router.get('/:id', optionalAuth, prompts.getPromptById);
router.post('/create', verifyJWT, upload.single('image'), prompts.createPrompt);
router.post('/', verifyJWT, upload.single('image'), prompts.createPrompt);

export default router;
