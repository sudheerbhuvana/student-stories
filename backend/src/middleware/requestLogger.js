import { logger } from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info('Request', `${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Capture response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req.method, req.path, res.statusCode);
        logger.debug('Response Time', `${req.method} ${req.path} completed in ${duration}ms`);
    });

    next();
};
