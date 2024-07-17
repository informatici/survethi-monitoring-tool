const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');

require('dotenv').config();

const baseURL = 'http://puppeteer:3000/generate-pdf?url=http://tool:5000';
const cronSchedule = process.env.CRON_SCHEDULE || '* * * * *'; // Default to run every minute if not set
const logLevel = process.env.SCHEDULER_LOGLEVEL

const templatePath = process.env.PUPPETEER_TEMPLATE + '.html' || "pdf_template.html";
const diseaseFilter = process.env.REPORT_DISEASE_FILTER || "";
const temporalFilter = process.env.REPORT_TEMPORAL_FILTER || "";
const emailSubject = process.env.NODEMAIL_SUBJECT || 'Scheduled PDF report';
const emailBody = process.env.NODEMAIL_BODY || 'Please find attached the scheduled PDF report.';

// Construct the full URL with query parameters
const fullURL = `${baseURL}&templatePath=${encodeURIComponent(templatePath)}&diseaseFilter=${encodeURIComponent(diseaseFilter)}&temporalFilter=${encodeURIComponent(temporalFilter)}&emailSubject=${encodeURIComponent(emailSubject)}&emailBody=${encodeURIComponent(emailBody)}`;


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
        //new winston.transports.File({ filename: 'scheduler.log' }),
        new winston.transports.Console() // Log to console as well
    ]
});

logger.info(`Scheduler started.`);

cron.schedule(cronSchedule, async () => {
    logger.info(`Scheduler running...`);
    try {
        const response = await axios.get(fullURL, { timeout: 120000 }); // 120 seconds
        logger.info('Scheduled task response:', response.data);
    } catch (error) {
        logger.error('Error in scheduled task:', error);
    }
    logger.info(`Scheduler ended.`);
});

process.stdin.resume();