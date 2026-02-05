import express from 'express';
import * as prompts from '../controllers/promptController.js';
import verifyJWT from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/trending', prompts.getTrendingPrompts);
router.get('/all',  prompts.getAllPrompts);
router.get('/getProfilePrompts', verifyJWT, prompts.getProfilePrompts);
router.get('/:id',  prompts.getPromptById);
router.post("/create", verifyJWT, upload.single("image"), prompts.createPrompt);

export default router;
