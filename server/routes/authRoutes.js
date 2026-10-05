import express from 'express';
import verifyJWT, { optionalAuth } from '../middlewares/authMiddleware.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify', verifyJWT, (req, res) => {
  res.status(200).json({ success: true, message: 'Token is valid', user: req.user });
});
router.post('/addlike', optionalAuth, authController.addLike);
router.post('/removelike', optionalAuth, authController.removeLike);
router.post('/logout', authController.logout);
router.post('/likelist', optionalAuth, authController.likeList);
router.get('/getuser', verifyJWT, authController.getUserId);

export default router;
