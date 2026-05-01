import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'

import connectDB from './config/connectDB.js';
import authRoutes from './routes/authRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import problemRoutes from './routes/problemRoutes.js'
import solutionRoutes from './routes/solutionRoutes.js'
import voteRoutes from './routes/voteRoutes.js'
import discussionRoutes from './routes/discussionRoutes.js'
import trackingRoutes from './routes/trackingRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import imageUploadRoutes from './routes/imageUploadRoutes.js'

dotenv.config()

const app = express()

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/problems',authMiddleware, problemRoutes)
app.use('/api/solutions', authMiddleware, solutionRoutes)
app.use('/api/votes', authMiddleware, voteRoutes)
app.use('/api/discussions', authMiddleware, discussionRoutes)
app.use('/api/tracking', authMiddleware, trackingRoutes)
app.use('/api/notifications', authMiddleware, notificationRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)
app.use('/api/analytics', authMiddleware, analyticsRoutes)
app.use('/api/admin', authMiddleware, adminRoutes)
app.use('/api/images', authMiddleware, imageUploadRoutes)

app.get('/', (req, res) => res.send("Hello from server"))

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
})

const PORT = process.env.PORT || 3000

app.listen(PORT , async () => {
    await connectDB()
    console.log(`app running on http://localhost:${PORT}`)
})