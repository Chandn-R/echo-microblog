import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Specify colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Base formatter
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true })
);

// Console formatter (human-readable)
const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
  )
);

// File formatter (JSON)
const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports: [
    // Console transport (always on)
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Rotating error logs
    new DailyRotateFile({
      level: 'error',
      dirname: 'logs/errors',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),

    // Rotating all logs
    new DailyRotateFile({
      dirname: 'logs/combined',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: 'logs/exceptions',
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// Handle uncaught promise rejections
process.on('unhandledRejection', (reason) => {
  throw reason;
});

export default logger;