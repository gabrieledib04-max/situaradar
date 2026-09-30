import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/situaradar';

// CORS and JSON Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// Fallback route for API
app.get('*', (req, res) => {
  res.json({ message: "SituaRadar Backend API is running." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
