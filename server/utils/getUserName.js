import User from '../models/user.js';

export default async function getUserName(userID) {
    const username = await User.findById(userID).select('username');
    return username ? username.username : 'anonymous';
}