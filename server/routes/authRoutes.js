import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify', verifyJWT, (req, res) => {
  res.status(200).json({ success: true, message: 'Token is valid', user: req.user });
});
router.post('/addlike', authController.addLike);
router.post('/removelike', authController.removeLike);
router.post('/logout', authController.logout);
router.post('/likelist', authController.likeList);
router.get('/getuser', verifyJWT, authController.getUserId);

export default router;
