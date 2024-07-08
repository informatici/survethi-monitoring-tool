const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { promisify } = require('util');
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const winston = require('winston');

require('dotenv').config();

const app = express();
const port = 3000;
const logLevel = process.env.PUPPETEER_LOGLEVEL

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
        new winston.transports.File({ filename: 'puppeteer.log' }),
        new winston.transports.Console() // Log to console as well
    ]
});

async function generatePDFWithInteractions(url, outputPath) {
    logger.info(`Generate PDF with interactions from ${url}...`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
        protocolTimeout: 60000 // Set the protocol timeout to 60 seconds
    });
    const page = await browser.newPage();

    try {
        // Navigate to the webpage
        logger.info(`Accessing: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        logger.info(`Select week1 button...`);
        await page.waitForSelector('button#week1', { timeout: 60000 });

        logger.info(`Clicking week1 button...`);
        await page.click('button#week1');

        // logger.info(`Select leaflet-control-fullscreen...`);
        // const mapFullScreenSelector = "#mapid > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a"
        // await page.waitForSelector(mapFullScreenSelector, { timeout: 60000 });

        // logger.info(`Clicking leaflet-control-fullscreen...`);
        // await page.click(mapFullScreenSelector);

        // Wait for any resulting actions to complete if necessary
        await page.evaluate(async () => {
            await new Promise(resolve => {
                setTimeout(resolve, 15000); // Wait for 15 seconds
            });
        });

        // Extract data from the webpage
        const pageTitle = await page.title();
        const mapContent = await page.evaluate(() => {
            const mapElement = document.querySelector('#mapid');
            return mapElement ? mapElement.outerHTML : 'Map content not found';
        });

        // Wait for the download to start
        await page.evaluate(async () => {
            await new Promise(resolve => {
                setTimeout(resolve, 3000); // Wait for 3 seconds
            });
        });

        // Read the PDF template
        const templatePath = './pdf_template.html';
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders in the template with extracted data
        const renderedHTML = htmlTemplate
            .replace('{{pageTitle}}', pageTitle)
            .replace('{{mapContent}}', mapContent);
        await page.setContent(renderedHTML);
        
        // Create a new PDF file path for the generated PDF
        const generatedPath = 'generated.pdf';

        // Generate PDF
        await page.pdf({ path: generatedPath, format: 'A4' });
        logger.info(`PDF generated successfully at ${generatedPath}`);

    } catch (error) {
        logger.error('Error generating PDF:', error);
    } finally {
        await browser.close();
    }
}

async function sendEmailWithAttachments(filePath) {
    logger.info(`Send Email with attachments...`);
    
    try {
        // Nodemailer configuration
        let transporter = nodemailer.createTransport({
            service: process.env.NODEMAIL_SERVICE,
            host: process.env.NODEMAIL_HOST,
            port: process.env.NODEMAIL_PORT,
            secure: process.env.NODEMAIL_SECURE === 'true',
            auth: {
                user: process.env.NODEMAIL_EMAIL,
                pass: process.env.NODEMAIL_APP_PASSWORD
            },
            debug: process.env.NODEMAIL_DEBUG === 'true',
            logger: process.env.NODEMAIL_LOGGER === 'true'
        });

        // Email content
        logger.info(`Configure email server... `);
        let mailOptions = {
            from: process.env.NODEMAIL_EMAIL,
            to: [process.env.NODEMAIL_RECIPIENTS],
            subject: 'PDF Report',
            text: 'Please find attached the PDF report.',
            attachments: [
                {   // Attach PDF file
                    filename: 'generated.pdf',
                    path: path.join(__dirname, filePath)
                }
            ]
        };

        // Send email and await completion
        logger.info(`Sending email... `);
        let info = await transporter.sendMail(mailOptions);
        logger.info('Email sent:', info.response);

        return info;

    } catch (error) {
        logger.error('Error sending email:', error);
        throw error; // Propagate the error up if needed
    }
}

app.get('/generate-pdf', async (req, res) => {
    const { url } = req.query;
    const outputPath = 'generated.pdf';

    // Generate PDF
    await generatePDFWithInteractions(url, outputPath);

    // Check if the outputPath file exists
    try {
        await stat(outputPath);
    } catch (err) {
        logger.error('Error checking file:', err);
        res.status(500).send('Error checking file');
        return;
    }

    // Send email with attachments and await completion
    try {
        await sendEmailWithAttachments(outputPath);

        // Delete the file after sending email
        try {
            await unlink(outputPath);
        } catch (err) {
            logger.error('Error deleting file:', err);
            res.status(500).send('Error deleting file');
            return;
        }

        // If everything is successful, send a success response
        res.status(200).send('PDF generated and email sent successfully');
        
    } catch (error) {
        logger.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

app.listen(port, () => {
    logger.info(`Puppeteer server listening at http://localhost:${port}`);
});
