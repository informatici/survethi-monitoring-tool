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

// * * * * * command_to_execute
// | | | | |
// | | | | +---- Day of the week (0 - 7) (Sunday is 0 and 7)
// | | | +------ Month (1 - 12)
// | | +-------- Day of the month (1 - 31)
// | +---------- Hour (0 - 23)
// +------------ Minute (0 - 59)
//
// Special Characters:
//  *: Matches any value (wildcard)
//  ,: Separates multiple values (e.g., 1,15 in the minute field means "at minutes 1 and 15")
//  -: Specifies a range of values (e.g., 1-5 in the day of the week field means "Monday through Friday")
//  /: Specifies a step value (e.g., */5 in the minute field means "every 5 minutes")
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

// Keep the script running
process.stdin.resume();