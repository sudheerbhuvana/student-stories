import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentstories';

        logger.info('Database', 'Attempting to connect to MongoDB...');
        logger.debug('Database', `Connection URI: ${mongoURI.replace(/\/\/.*@/, '//***@')}`);

        await mongoose.connect(mongoURI);

        logger.success('Database', 'MongoDB connected successfully');
        logger.info('Database', `Database name: ${mongoose.connection.name}`);
    } catch (error) {
        logger.error('Database', 'MongoDB connection failed - Server will continue without database', error);
        logger.warn('Database', 'Some features requiring database will not work until MongoDB is connected');
        // Don't exit - let server run without database
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    logger.warn('Database', 'MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('Database', 'MongoDB error', err);
});
