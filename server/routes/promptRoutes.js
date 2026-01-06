import express from 'express';
import * as prompts from '../controllers/promptController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/trending', prompts.getTrendingPrompts);
router.get('/all',  prompts.getAllPrompts);
router.get('/:id',  prompts.getPromptById);
router.get('/getProfilePrompts',  prompts.getProfilePrompts);
router.post("/create", upload.single("image"), prompts.createPrompt);

export default router;
