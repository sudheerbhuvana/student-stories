import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error('ErrorHandler', `${req.method} ${req.path} - ${err.message}`, {
        stack: err.stack,
        statusCode: err.statusCode || 500
    });

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}; 
