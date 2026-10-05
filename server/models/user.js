import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'creator', 'admin'], default: 'buyer' },
    avatarUrl: { type: String, default: '' },
    creatorBalancePaise: { type: Number, default: 0 },
    likedPrompts: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Users = mongoose.model('Users', userSchema);
export default Users;