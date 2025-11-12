import express from 'express';
import * as prompts from '../controllers/promptController.js';

const router = express.Router();

router.get('/trending', prompts.getTrendingPrompts);
router.get('/all',  prompts.getAllPrompts);
router.get('/:id',  prompts.getPromptById);

export default router;
