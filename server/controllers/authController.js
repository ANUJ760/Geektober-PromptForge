import dotenv from 'dotenv'
dotenv.config();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Users from '../models/user.js';
import Prompt from '../models/prompt.js';

const JWT_SECRET = process.env.JWT_Secret_Key;

export async function signup(req, res) {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  let existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    username: data.username, 
    email: data.email, 
    password: hashedPassword
  };

  const User= await Users.insertMany(newUser);
  const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3600000,
  });

  res.status(201).json({ message: 'Signup successful', status: "ok", user: { id: newUser.id, email: newUser.email } });
}

export async function login (req, res) {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 3600000,
  });

  res.status(200).json({ message: 'Logged in successfully', status: "ok"});
}

export async function logout (req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ message: 'Logged out successfully' });
}

export async function getUserId(req, res) {
  res.json({id: req.user.id})
}

export async function addLike(req, res) {
  try {
    const promptId = req.body.promptId;
    const userId = req.body.userId;
    const updatedPrompt = await Prompt.findByIdAndUpdate(
        promptId,
        { $inc: { likes: 1 } },
        { new: true }
    );
    if (!updatedPrompt) {
        return res.status(404).json({ error: "Prompt not found" });
    }
    const updatedUser = await Users.findByIdAndUpdate(
        userId,
        { $addToSet: { likedPrompts: promptId }},
        { new: true }
    );
    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({
      prompt: updatedPrompt,
    });
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeLike(req, res) {
  try {
    const promptId = req.body.promptId;
    const userId = req.body.userId;
    const updatedPrompt = await Prompt.findByIdAndUpdate(
        promptId,
        { $inc: { likes: -1 } },
        { new: true }
    );
    if (!updatedPrompt) {
        return res.status(404).json({ error: "Prompt not found" });
    }
    const updatedUser = await Users.findByIdAndUpdate(
        userId,
        { $pull: { likedPrompts: promptId }},
        { new: true }
    );
    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({
      prompt: updatedPrompt,
    });
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function likeList(req, res) {
  const userId = req.body.userId;
  const user = await Users.findById(userId).populate('likedPrompts');
  res.json({ likedPrompts: user.likedPrompts });
}