const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');

require('dotenv').config();

const url = 'http://localhost:3000/generate-pdf';
const cronSchedule = process.env.CRON_SCHEDULE || '* * * * *'; // Default to run every minute if not set
const logLevel = process.env.SCHEDULER_LOGLEVEL

// Configure logging
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'scheduler.log' }),
        new winston.transports.Console() // Log to console as well
    ]
});

logger.info(`Scheduler started.`);

cron.schedule(cronSchedule, async () => {
    logger.info(`Scheduler running...`);
    try {
        const response = await axios.get(url, { timeout: 10000 }); // 10 seconds
        logger.info('Scheduled task response:', response.data);
    } catch (error) {
        logger.error('Error in scheduled task:', error);
    }
    logger.info(`Scheduler ended.`);
});

process.stdin.resume();