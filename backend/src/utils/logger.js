// Simple colored console logger for backend
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const getTimestamp = () => {
    return new Date().toISOString();
};

export const logger = {
    info: (context, message, data = null) => {
        console.log(
            `${colors.cyan}[INFO]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}[${context}]${colors.reset} ${message}`,
            data ? data : ''
        );
    },

    success: (context, message, data = null) => {
        console.log(
            `${colors.green}[SUCCESS]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}[${context}]${colors.reset} ${message}`,
            data ? data : ''
        );
    },

    warn: (context, message, data = null) => {
        console.warn(
            `${colors.yellow}[WARN]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}[${context}]${colors.reset} ${message}`,
            data ? data : ''
        );
    },

    error: (context, message, error = null) => {
        console.error(
            `${colors.red}[ERROR]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}[${context}]${colors.reset} ${message}`,
            error ? error : ''
        );
    },

    debug: (context, message, data = null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `${colors.magenta}[DEBUG]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}[${context}]${colors.reset} ${message}`,
                data ? data : ''
            );
        }
    },

    request: (method, path, status) => {
        const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
        console.log(
            `${colors.blue}[REQUEST]${colors.reset} ${colors.dim}${getTimestamp()}${colors.reset} ${colors.bright}${method}${colors.reset} ${path} ${statusColor}${status}${colors.reset}`
        );
    }
};
