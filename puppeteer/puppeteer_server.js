const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { promisify } = require('util');
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const winston = require('winston');
const XLSX = require('xlsx');

require('dotenv').config();

const app = express();
const port = 3000;
const logLevel = process.env.PUPPETEER_LOGLEVEL || "info"
const templatePath = process.env.PUPPETEER_TEMPLATE + '.html' || "pdf_template.html"
const disease_filter = process.env.REPORT_DISEASE_FILTER || ""
const temporal_filter = process.env.REPORT_TEMPORAL_FILTER || ""

var selectedDiseases = []

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
        //new winston.transports.File({ filename: 'puppeteer.log' }),
        new winston.transports.Console() // Log to console as well
    ]
});

function getFormattedDate() {
    logger.debug(`Calculating fromDate, toDate, month, year for '${temporal_filter}' selector...`)
    const now = new Date();
    let toDate = now;
    let fromDate = new Date(toDate);

    switch (temporal_filter) {
        case 'today':
            fromDate = toDate;
            break;
        case 'yesterday':
            fromDate.setDate(toDate.getDate() - 1);
            toDate = fromDate;
            break;
        case 'days3':
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setDate(toDate.getDate() - 3);
            break;
        case 'week1':
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setDate(toDate.getDate() - 7);
            break;
        case 'weeks2':
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setDate(toDate.getDate() - 14);
            break;
        case 'month1':
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setMonth(toDate.getMonth() - 1);
            break;
        case 'months3':
            toDate.setDate(toDate.getDate() - 1);
            fromDate.setMonth(toDate.getMonth() - 3);
            break;
        default:
            fromDate = toDate;
    }

    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];
    const month = String(toDate.getMonth() + 1).padStart(2, '0');
    const year = String(toDate.getFullYear());

    logger.debug(`==> ${fromDateStr}, ${toDateStr}, ${month}, ${year}.`)

    return { fromDate: fromDateStr, toDate: toDateStr, month, year };
}

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

async function generatePDFWithInteractions(url, outputPath) {
    logger.info(`Start generating PDF from interactions with ${url}...`);

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
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        logger.info('Page accessed.');

        // Perform interactions (disease filter, week1 button, etc.)
        await performInteractions(page);

        // Wait for the table to load
        logger.info(`Waiting for table to load...`);
        await page.waitForSelector('#table_primary');

        // Check if the table has at least one valid data row
        const tableHasData = await page.evaluate(() => {
            const noRecordsFound = document.querySelector('#table_primary tbody tr.no-records-found');
            const tableRows = document.querySelectorAll('#table_primary tbody tr');
            return !noRecordsFound && tableRows.length > 0;
        });

        var tableHtml = "No data."
        if (tableHasData) {
            // Extract table data
            const tableData = await extractTableData(page);
            // Generate HTML table for the top 10 only
            tableHtml = generateHtmlTable(tableData);
        } else {
            logger.info('No data available in the table.');
        }

        var selectedDiseasesHtml = "No disease selected."
        if (selectedDiseases.length > 0) {
            selectedDiseasesHtml = generateHtmlDiseaseList(selectedDiseases);
        }

        // Extract data from the webpage
        const pageTitle = await page.title();
        const mapImageUrl = await extractMapImage(page);

        // Read the PDF template
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const baseDir = path.dirname(templatePath);

        // Replace local images paths (if any) with base64 data URLs
        const updatedHtmlTemplate = replaceImagePathsWithBase64(htmlTemplate, baseDir);

        // Get temporal placeholders
        const { fromDate, toDate, month, year } = getFormattedDate(disease_filter);

        // Replace placeholders in the template with extracted data
        const renderedHTML = updatedHtmlTemplate
            .replaceAll('{{title}}', pageTitle)
            .replace('{{fromDate}}', fromDate)
            .replace('{{toDate}}', toDate)
            .replace('{{month}}', month)
            .replace('{{year}}', year)
            .replace('{{mapImage}}', mapImageUrl)
            .replace('{{dataTable}}', tableHtml)
            .replace('{{diseaseList}}', selectedDiseasesHtml);
        
        await page.setContent(renderedHTML);

        // Delay 2 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        
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

        // Delay 5 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        logger.info(`PDF generated successfully at ${outputPath}`);

    } catch (error) {
        logger.error('Error generating PDF:', error);
        throw error; // Propagate the error up
    } finally {
        logger.info('Closing the browser...');
        await browser.close();
        logger.info('Browser closed.');
    }
}

async function performInteractions(page) {

    // Click the disease filters
    if (disease_filter != "") {
        logger.info('Waiting for disease filter button...');
        await page.waitForSelector(`button[data-id="main_filter"]`, { timeout: 60000 });
        logger.info('Disease filter button found.');

        logger.info(`Select disease filter '${disease_filter}'...`);
        await page.click('button[data-id="main_filter"]');
        await page.waitForSelector('.dropdown-menu.show', { timeout: 60000 });
        await page.select('select#main_filter', disease_filter);
        logger.info('Disease filter selected.');

        // Click outside the dropdown to trigger the map update and wait 5 seconds
        await page.click('body');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        // Get the list of selected diseases as effect 
        logger.info(`Retrieving the list of selected diseases for '${disease_filter}...`);
        await page.click('button[data-id="main_filter"]');
        selectedDiseases = await page.evaluate(() => {
            const options = document.querySelectorAll('.dropdown-item.selected');
            return Array.from(options).map(option => option.innerText.trim());
        });
        // Click outside the dropdown (it should not trigger reload)
        await page.click('body');
        logger.debug('Selected diseases size : ' + selectedDiseases.length);
        selectedDiseases.forEach(disease => logger.debug('==> ' + disease));

    } else {
        logger.info(`No disease filter selected.`);
    }

    // Click the week1 button
    if (temporal_filter != "") {
        logger.info(`Select '${temporal_filter}' button...`);
        await page.waitForSelector(`button#${temporal_filter}`, { timeout: 60000 });
        logger.info(`Clicking ${temporal_filter} button...`);
        await page.click(`button#${temporal_filter}`);
    }else {
        logger.info(`No temporal filter selected.`);
    }

    // Wait for the Map loading indicator to disappear
    logger.info(`Waiting for map to load...`);
    await page.waitForFunction(() => {
        const loadingIndicator = document.querySelector('#map-loading-indicator');
        return loadingIndicator && !loadingIndicator.classList.contains('loading');
    }, { timeout: 60000 });

    // Delay 3 seconds
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

    // Hide all leaflet-control elements except the legenda
    await page.evaluate(() => {
        const controls = document.querySelectorAll('.leaflet-control');
        controls.forEach(control => {
        if (!control.classList.contains('info') || !control.classList.contains('legenda')) {
            control.style.display = 'none';
        }
        });
    });

    // Delay 3 seconds
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
}

async function extractTableData(page) {
    // Check if the page list dropdown exists
    const pageListDisplayed = await page.evaluate(() => {
        const pageListElement = document.querySelector('.page-list');
        return pageListElement && window.getComputedStyle(pageListElement).display !== 'none';
    });
    logger.debug(`Table rows > 5: ${pageListDisplayed}.`);

    if (pageListDisplayed) {
        logger.debug(`Expanding and sorting table...`);
        // Click on the "Cases" column header twice to sort descending
        await page.click('#table_primary thead th:nth-child(2)'); // Adjust nth-child index as needed
        await page.click('#table_primary thead th:nth-child(2)'); // Click twice to sort descending
    
        // Select the dropdown menu for page size and click on 10
        await page.click('.page-size'); 
        await page.waitForSelector('.dropdown-menu.show .dropdown-item'); // Wait for dropdown items to appear
        await page.click('.dropdown-menu.show .dropdown-item:nth-child(5)'); // Click on the 5th item (All)
    
        // Delay 1 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    }

    // Extract specific columns from the table
    logger.info(`Extracting relevant data...`);
    const tableData = await page.evaluate(() => {
        const tableRows = Array.from(document.querySelectorAll('#table_primary tbody tr'));
        return tableRows.map(row => {
            const columns = row.querySelectorAll('td');
            return {
                type: columns[0].textContent.trim(),        // Type
                cases: columns[1].textContent.trim(),       // Cases
                disease: columns[2].textContent.trim(),     // Disease
                woredaTown: columns[3].textContent.trim(),  // Woreda/Town
                kebele: columns[4].textContent.trim()       // Kebele
            };
        });
    });

    await exportToExcel(tableData)

    return tableData;
}

async function exportToExcel(tableData) {
    logger.info(`Exporting to Excel file...`);
    // Create a new workbook and a new sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(tableData);

    // Append the sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'tableData.xlsx');

    logger.info(`Excel file saved to ${'tableData.xlsx'}`);
}

function generateHtmlDiseaseList(diseaseList) {
    const tableHtml = `
        <table border="1" style="border-collapse: collapse; border: 1px solid #000; width: 100%; text-align: left;">
        <thead>
            <tr>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Code - Disease</th>
            </tr>
        </thead>
        <tbody>
            ${diseaseList.map(disease => `
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${disease}</td>
            </tr>
            `).join('')}
        </tbody>
        </table>
    `;
    return tableHtml;
}

function generateHtmlTable(tableData) {
    logger.info(`Generate HTML for TOP 10 table with total...`);

    // Slice the table data to get the first 10 rows
    const rowsToDisplay = tableData.slice(0, 10);

    // Calculate the total cases
    const totalCases = tableData.reduce((sum, row) => sum + parseInt(row.cases, 10), 0);

    const tableHtml = `
        <table border="1" style="border-collapse: collapse; border: 1px solid #000; width: 100%; text-align: left;">
        <thead>
            <tr>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Type</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Woreda/Town</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Kebele</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Disease</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right;">Cases</th>
            </tr>
        </thead>
        <tbody>
            ${rowsToDisplay.map(row => `
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.type}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.woredaTown}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.kebele}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.disease}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${row.cases}</td>
            </tr>
            `).join('')}
            ${tableData.length > 10 ? `
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: left;">...</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: left;">...</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: left;">...</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: left;">...</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: right;">...</td>
                </tr>
                ` : ''}
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;" colspan="4">Total:</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>${totalCases}</strong></td>
            </tr>    
        </tbody>
        </table>
    `;
    return tableHtml;
}

async function extractMapImage(page) {
    const mapElement = await page.$('#mapid');
    const mapImagePath = path.join(__dirname, 'map.png');
    // Take a screenshot of the map
    await mapElement.screenshot({ path: 'map.png' });
    // Convert the map image to a base64 data URL
    const mapImageBase64 = fs.readFileSync(mapImagePath, { encoding: 'base64' });
    const mapImageUrl = `<img src="data:image/png;base64,${mapImageBase64}" alt="Map">`;
    return mapImageUrl
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
                },
                {   // Attach PDF file
                    filename: 'tableData.xlsx',
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
            logger.info('PDF (only) generated successfully, sending status=201...');
            res.status(201).send('PDF generated successfully');
        }
    } catch (err) {
        logger.error('Error generating PDF file:', err);
        res.status(500).send('Error generating PDF file');
        return;
    }
});

app.listen(port, () => {
    logger.info(`Puppeteer server listening at http://localhost:${port}`);
});
