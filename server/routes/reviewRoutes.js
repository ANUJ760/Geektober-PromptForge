import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', verifyJWT, reviewController.createReview);
router.get('/prompt/:promptId', reviewController.getPromptReviews);

export default router;
