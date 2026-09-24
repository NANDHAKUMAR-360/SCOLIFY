import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import { ENV } from './config/env.js';

const app = express();

// Security & Headers Middleware
app.use(helmet());
app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api/', apiRateLimiter);

// Versioned API Routes (/api/v1/)
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;
