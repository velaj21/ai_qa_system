import dotenv from 'dotenv'; // Load environment variables
import express from 'express';
import documentRouter from './routes/documentRoutes.js';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

dotenv.config(); // Initialize dotenv

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  });

// Use CORS middleware
app.use(cors());
// Apply rate limiter to all routes
app.use(limiter);

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({extended: true})); // Parse URL-encoded bodies

// Routes
app.use('/api/documents', documentRouter);
// app.use('/api/questions', questionRoutes);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
