import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Users from '../models/user.js';
import Prompt from '../models/prompt.js';

const JWT_SECRET = process.env.JWT_Secret_Key || 'default_jwt_secret_dev_key_promptforge';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingUser = await Users.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Signup successful',
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Signup failed', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Logged in successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
}

export async function logout(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

export async function getUserId(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await Users.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      likedPrompts: user.likedPrompts || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: err.message });
  }
}

export async function addLike(req, res) {
  try {
    const promptId = req.body.promptId;
    const userId = req.user?.id || req.body.userId;

    if (!promptId) {
      return res.status(400).json({ success: false, error: 'Prompt ID is required' });
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required to like' });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { $addToSet: { likedPrompts: promptId } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedPrompt = await Prompt.findByIdAndUpdate(
      promptId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    return res.json({
      success: true,
      prompt: updatedPrompt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function removeLike(req, res) {
  try {
    const promptId = req.body.promptId;
    const userId = req.user?.id || req.body.userId;

    if (!promptId) {
      return res.status(400).json({ success: false, error: 'Prompt ID is required' });
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required to unlike' });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { $pull: { likedPrompts: promptId } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedPrompt = await Prompt.findByIdAndUpdate(
      promptId,
      { $inc: { likes: -1 } },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    return res.json({
      success: true,
      prompt: updatedPrompt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function likeList(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.json({ likedPrompts: [] });
    }
    const user = await Users.findById(userId);
    return res.json({ likedPrompts: user?.likedPrompts || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}