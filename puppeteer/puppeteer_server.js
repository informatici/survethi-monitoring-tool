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
const templatePath = 'pdf_template.html';

// Function to convert an image to a base64 data URL
function imageToBase64(imagePath) {
    const imageData = fs.readFileSync(imagePath);
    const base64Data = imageData.toString('base64');
    const mimeType = path.extname(imagePath).slice(1) === 'svg' ? 'svg+xml' : path.extname(imagePath).slice(1);
    return `data:image/${mimeType};base64,${base64Data}`;
}

// Function to replace image paths in the HTML template with base64 data URLs
function replaceImagePathsWithBase64(htmlTemplate, baseDir) {
    const imageTagRegex = /<img[^>]+src="([^">]+)"/g;
    return htmlTemplate.replace(imageTagRegex, (match, imagePath) => {
        const absoluteImagePath = path.resolve(baseDir, imagePath);
        if (fs.existsSync(absoluteImagePath)) {
            const base64Image = imageToBase64(absoluteImagePath);
            return match.replace(imagePath, base64Image);
        }
        return match;
    });
}

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

        // Wait for the Map loading indicator to disappear
        logger.info(`Waiting for map to load...`);
        await page.waitForFunction(() => {
            const loadingIndicator = document.querySelector('#map-loading-indicator');
            return loadingIndicator && !loadingIndicator.classList.contains('loading');
        }, { timeout: 60000 });

        // Delay 3 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

        // Hide Map Leaflet controllers
        await page.evaluate(() => {
            const controllers = document.querySelectorAll('.leaflet-control');
            controllers.forEach(controller => {
                controller.style.display = 'none';
            });
        });

        // Delay 3 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

        // Extract data from the webpage
        const pageTitle = await page.title();
        const mapElement = await page.$('#mapid');
        const mapImagePath = path.join(__dirname, 'map.png');
        // Take a screenshot of the map
        await mapElement.screenshot({ path: 'map.png' });
        // Convert the map image to a base64 data URL
        const mapImageBase64 = fs.readFileSync(mapImagePath, { encoding: 'base64' });
        const mapImageUrl = `<img src="data:image/png;base64,${mapImageBase64}" alt="Map">`;

        // Read the PDF template
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const baseDir = path.dirname(templatePath);

        // Replace image paths with base64 data URLs
        const updatedHtmlTemplate = replaceImagePathsWithBase64(htmlTemplate, baseDir);

        // Replace placeholders in the template with extracted data
        const renderedHTML = updatedHtmlTemplate
            .replace('{{pageTitle}}', pageTitle)
            .replace('{{mapImage}}', mapImageUrl);
        
        await page.setContent(renderedHTML);
        
        // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            displayHeaderFooter: true,
            printBackground: true,
            margin: {
                top: '50px',
                bottom: '50px',
                left: '50px',
                right: '50px'
            }
        });
        logger.info(`PDF generated successfully at ${outputPath}`);

    } catch (error) {
        logger.error('Error generating PDF:', error);
        throw error; // Propagate the error up
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
        throw error; // Propagate the error up
    }
}

app.get('/generate-pdf', async (req, res) => {
    const { url } = req.query;
    const outputPath = 'generated.pdf';

    // Generate PDF
    try {
        await generatePDFWithInteractions(url, outputPath);
    } catch (err) {
        logger.error('Error generating PDF file:', err);
        res.status(500).send('Error generating PDF file');
        return;
    }
    // Check if the outputPath file exists
    try {
        await stat(outputPath);
    } catch (err) {
        logger.error('Error checking file:', err);
        res.status(500).send('Error checking file');
        return;
    }

    if (process.env.NODEMAIL_ACTIVE === 'true') {
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
    } else {
        res.status(201).send('PDF generated successfully');
    }
});

app.listen(port, () => {
    logger.info(`Puppeteer server listening at http://localhost:${port}`);
});
