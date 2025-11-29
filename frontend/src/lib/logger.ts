/**
 * Logger utility for consistent logging throughout the application
 * Supports different log levels and environment-based configuration
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

interface LogConfig {
    enabled: boolean;
    minLevel: LogLevel;
    timestamp: boolean;
}

class Logger {
    private config: LogConfig = {
        enabled: process.env.NODE_ENV !== 'production',
        minLevel: LogLevel.DEBUG,
        timestamp: true,
    };

    private levelPriority: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
    };

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;
        return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
    }

    private formatMessage(level: LogLevel, context: string, message: string, data?: any): string {
        const timestamp = this.config.timestamp ? `[${new Date().toISOString()}]` : '';
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
        return `${timestamp} [${level}] [${context}] ${message}${dataStr}`;
    }

    debug(context: string, message: string, data?: any) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.log(this.formatMessage(LogLevel.DEBUG, context, message, data));
        }
    }

    info(context: string, message: string, data?: any) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, context, message, data));
        }
    }

    warn(context: string, message: string, data?: any) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, context, message, data));
        }
    }

    error(context: string, message: string, error?: any) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, context, message, error));
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
        }
    }

    // Component lifecycle logging helpers
    componentMount(componentName: string, props?: any) {
        this.debug(componentName, 'Component mounted', props);
    }

    componentUnmount(componentName: string) {
        this.debug(componentName, 'Component unmounted');
    }

    componentRender(componentName: string, renderCount?: number) {
        this.debug(componentName, `Component rendered${renderCount ? ` (count: ${renderCount})` : ''}`);
    }

    // User interaction logging
    userAction(componentName: string, action: string, details?: any) {
        this.info(componentName, `User action: ${action}`, details);
    }

    // Performance logging
    performance(context: string, operation: string, duration: number) {
        this.info(context, `Performance: ${operation} took ${duration}ms`);
    }

    // Configure logger
    configure(config: Partial<LogConfig>) {
        this.config = { ...this.config, ...config };
    }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
