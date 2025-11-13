import dotenv from 'dotenv'
dotenv.config();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import users from '../models/user.js'

const JWT_SECRET = process.env.JWT_Secret_Key;

export async function signup (req, res) {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  let existingUser = await users.findOne({ email: req.body.email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    username: data.username, 
    email: data.email, 
    password: hashedPassword
  };

  const User= await users.insertMany(newUser);
  const token = jwt.sign({ username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

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
  const user = await users.findOne({ email: email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3600000,
  });

  res.status(200).json({ message: 'Logged in successfully', status: "ok"});
}

export async function logout (req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  res.json({ message: 'Logged out successfully' });
}

export function dashboard (req, res) {
  res.json({ message: `Welcome ${req.user.username}` });
}