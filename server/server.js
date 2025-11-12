import dotenv from 'dotenv'

dotenv.config();

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import connectDB from './utils/connectDB.js'

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: "https://test-smp-i9l5.vercel.app/",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

connectDB();
app.use('/users', authRoutes);
app.use('/prompts', promptRoutes);

app.get('/', (req, res) => {
    res.end('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});