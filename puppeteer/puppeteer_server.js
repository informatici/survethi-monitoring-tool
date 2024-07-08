const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const port = 3000;

async function generatePDFWithInteractions(url, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
        protocolTimeout: 60000 // Set the protocol timeout to 60 seconds
    });
    const page = await browser.newPage();

    try {
        // Navigate to the webpage
        console.log(`Accessing: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        console.log(`Select week1 button...`);
        await page.waitForSelector('button#week1', { timeout: 60000 });

        console.log(`Clicking week1 button...`);
        await page.click('button#week1');

        // console.log(`Select leaflet-control-fullscreen...`);
        // const mapFullScreenSelector = "#mapid > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-fullscreen.leaflet-bar.leaflet-control > a"
        // await page.waitForSelector(mapFullScreenSelector, { timeout: 60000 });

        // console.log(`Clicking leaflet-control-fullscreen...`);
        // await page.click(mapFullScreenSelector);

        // Wait for any resulting actions to complete if necessary
        await page.evaluate(async () => {
            await new Promise(resolve => {
                setTimeout(resolve, 15000); // Wait for 15 seconds
            });
        });

        // Extract data from the webpage (example)
        const pageTitle = await page.title();
        const mapContent = await page.evaluate(() => {
            const mapElement = document.querySelector('#mapid');
            return mapElement ? mapElement.outerHTML : 'Map content not found';
        });

        // Wait for the download to start (adjust as necessary)
        await page.evaluate(async () => {
            await new Promise(resolve => {
                setTimeout(resolve, 3000); // Wait for 3 seconds
            });
        });

        // Read the custom PDF template
        const templatePath = './pdf_template.html';
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders in the template with extracted data
        const renderedHTML = htmlTemplate
            .replace('{{pageTitle}}', pageTitle)
            .replace('{{mapContent}}', mapContent);
        await page.setContent(renderedHTML);
        
        // Create a new PDF file path for the generated PDF
        const generatedPath = 'generated.pdf';

        // Generate PDF with template and overlay mapContent
        await page.pdf({ path: generatedPath, format: 'A4' });
        console.log(`PDF generated successfully at ${generatedPath}`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        await browser.close();
    }
}

async function sendEmailWithAttachments(filePath) {
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
    console.log(`Configure email server... `);
    let mailOptions = {
        from: process.env.NODEMAIL_EMAIL,
        to: [process.env.NODEMAIL_RECIPIENTS],
        subject: 'PDF and CSV Report',
        text: 'Please find attached the PDF and CSV report.',
        attachments: [
            {   // Attach PDF file
                filename: 'generated.pdf',
                path: path.join(__dirname, 'generated.pdf')
            },
            // {   // Attach CSV file
            //     filename: 'downloaded.csv',
            //     path: csvFilePath
            // }
        ]
    };

    // Send email
    console.log(`Sending email... `);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });
}

app.get('/generate-pdf', async (req, res) => {
    const { url } = req.query;
    const outputPath = 'generated.pdf'; // Change as needed

    try {
        await generatePDFWithInteractions(url, outputPath);
        await sendEmailWithAttachments(outputPath);
        console.log(`Downloading: ${outputPath}`);
        res.download(outputPath);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(port, () => {
    console.log(`Puppeteer server listening at http://localhost:${port}`);
});
