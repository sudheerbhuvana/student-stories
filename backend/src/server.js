import './config/env.js'; // Must be first import
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import aiRoutes from './routes/ai.js';
import socialRoutes from './routes/social.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import newsletterRoutes from './routes/newsletter.js';
import contactRoutes from './routes/contact.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;
logger.info('Server', `MONGODB_URI type: ${typeof uri}`);
logger.info('Server', `MONGODB_URI length: ${uri ? uri.length : 0}`);
if (uri) {
    logger.info('Server', `MONGODB_URI starts with: ${uri.substring(0, 10)}...`);
}
logger.info('Server', 'Environment variables loaded');


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
logger.info('Server', 'Configuring middleware');

// Raw request logging
app.use((req, res, next) => {
    console.log(`[RAW] Incoming request: ${req.method} ${req.path}`);
    next();
});

app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Log all requests

// Routes
logger.info('Server', 'Registering routes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
    logger.debug('Health', 'Health check endpoint called');
    res.json({ status: 'ok', message: 'KL Unity API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.success('Server', `Server running on port ${PORT}`);
    logger.info('Server', `API available at http://localhost:${PORT}/api`);
    logger.info('Server', `Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
