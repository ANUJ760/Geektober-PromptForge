import User from '../models/user.js';

export default async function getUserName(userID) {
    const username = await User.findOne({ _id: userID }).select('username');
    return username ? username.username : 'anonymous';
}