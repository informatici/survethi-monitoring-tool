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
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();
const port = 3000;

// Global default values
let logLevel = process.env.PUPPETEER_LOGLEVEL || "info";
let templatePath = process.env.PUPPETEER_TEMPLATE + '.html' || "pdf_template.html";
let diseaseFilter = process.env.REPORT_DISEASE_FILTER || "";
let temporalFilter = process.env.REPORT_TEMPORAL_FILTER || "";
let emailSubject = process.env.NODEMAIL_SUBJECT || 'PDF report';
let emailBody = process.env.NODEMAIL_BODY || 'Please find attached the PDF report.';

// Generate random filenames with timestamp
const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
const pdfFilename = `pdf_${timestamp}_${uuidv4()}.pdf`;
const xlsxFilename = `xls_${timestamp}_${uuidv4()}.xlsx`;
const mapFilename = `map_${timestamp}_${uuidv4()}.png`;
const graphFilename = `chart_${timestamp}_${uuidv4()}.png`;

// Create attachment filenames
const date = timestamp.slice(0,8);
let pdfAttachment = `report_${date}_${diseaseFilter}_${temporalFilter}.pdf`;
let xlsxAttachment = `data_${date}_${diseaseFilter}_${temporalFilter}.xlsx`;

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
    logger.debug(`Calculating fromDate, toDate, month, year for '${temporalFilter}' selector...`)
    const now = new Date();
    let toDate = now;
    let fromDate = new Date(toDate);

    switch (temporalFilter) {
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

async function generatePDFWithInteractions(url) {
    logger.info(`Start generating PDF from interactions with ${url}...`);

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 120000 // 120 seconds
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
            // Generate graph from tableData
            generateBarChart(tableData);

        } else {
            logger.info('No data available in the table.');
        }

        var selectedDiseasesHtml = "No (or all) disease selected."
        if (selectedDiseases.length > 0) {
            selectedDiseasesHtml = generateHtmlDiseaseList(selectedDiseases);
        }

        // Extract data from the webpage
        const pageTitle = await page.title();
        const mapImageUrl = await extractMapImage(page);
        const mapGraphUrl = await extractGraphImage(graphFilename);

        // Read the PDF template
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const baseDir = path.dirname(templatePath);

        // Replace local images paths (if any) with base64 data URLs
        const updatedHtmlTemplate = replaceImagePathsWithBase64(htmlTemplate, baseDir);

        // Get temporal placeholders
        const { fromDate, toDate, month, year } = getFormattedDate(diseaseFilter);

        // Replace placeholders in the template with extracted data
        const renderedHTML = updatedHtmlTemplate
            .replaceAll('{{title}}', pageTitle)
            .replace('{{fromDate}}', fromDate)
            .replace('{{toDate}}', toDate)
            .replace('{{month}}', month)
            .replace('{{year}}', year)
            .replace('{{mapImage}}', mapImageUrl)
            .replace('{{dataTable}}', tableHtml)
            .replace('{{graphImage}}', mapGraphUrl)
            .replace('{{diseaseList}}', selectedDiseasesHtml);
        
        await page.setContent(renderedHTML);

        // Delay 2 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        
        // Generate PDF
        await page.pdf({
            path: pdfFilename,
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

        logger.info(`PDF generated successfully at ${pdfFilename}`);

    } catch (error) {
        logger.error('Error generating PDF:', error);
        throw error; // Propagate the error up
    } finally {
        logger.info('Closing the browser...');
        await browser.close();
        logger.info('Browser closed.');
    }
}

async function generateBarChart(tableData) {
    logger.info(`Generating chart...`);
    // Prepare the data
    const groupedData = tableData.reduce((acc, row) => {
        if (!acc[row.disease]) {
            acc[row.disease] = {};
        }
        if (!acc[row.disease][row.woreda]) {
            acc[row.disease][row.woreda] = 0;
        }
        acc[row.disease][row.woreda] += parseInt(row.cases, 10);
        return acc;
    }, {});

    const diseases = Object.keys(groupedData);
    const woredas = [...new Set(tableData.map(row => row.woreda))];

    const datasets = diseases.map(disease => ({
        label: disease,
        data: woredas.map(woreda => groupedData[disease][woreda] || 0),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        borderWidth: 1
    }));

    // Create the chart
    const width = 800; // width of the canvas
    const height = 600; // height of the canvas
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'bar',
        data: {
            labels: woredas,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            },
            responsive: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Save the chart as an image
    fs.writeFileSync(graphFilename, image);
    logger.info(`Chart saved as ${graphFilename}`);
}

async function performInteractions(page) {

    // Click the disease filters
    if (diseaseFilter != "") {
        logger.info('Waiting for disease filter button...');
        await page.waitForSelector(`button[data-id="main_filter"]`, { timeout: 60000 });
        logger.info('Disease filter button found.');

        logger.info(`Select disease filter '${diseaseFilter}'...`);
        await page.click('button[data-id="main_filter"]');
        await page.waitForSelector('.dropdown-menu.show', { timeout: 60000 });
        await page.select('select#main_filter', diseaseFilter);
        logger.info('Disease filter selected.');

        // Click outside the dropdown to trigger the map update and wait 5 seconds
        await page.click('body');
        await page.waitForFunction(() => {
            const loadingIndicator = document.querySelector('#map-loading-indicator');
            return loadingIndicator && !loadingIndicator.classList.contains('loading');
        }, { timeout: 60000 });
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        // Get the list of selected diseases as effect of diseaseFilter
        logger.info(`Retrieving the list of selected diseases for '${diseaseFilter}'...`);
        await page.waitForSelector('button[data-id="main_filter"]', { visible: true });

        // Zoom out before clicking the filter to be sure to show the full list of selected diseases
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 0.1 });
        await page.click('button[data-id="main_filter"]');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
        selectedDiseases = await page.evaluate(() => {
            const options = document.querySelectorAll('.dropdown-item.selected');
            return Array.from(options).map(option => option.innerText.trim());
        });
        // Zoom back in after selecting the diseases
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

        // Click outside the dropdown (it should not trigger reload)
        await page.click('body');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
        
        logger.debug('Selected diseases size : ' + selectedDiseases.length);
        selectedDiseases.forEach(disease => logger.debug('==> ' + disease));

    } else {
        logger.info(`No disease filter selected.`);
    }

    // Click the week1 button
    if (temporalFilter != "") {
        logger.info(`Select '${temporalFilter}' button...`);
        await page.waitForSelector(`button#${temporalFilter}`, { timeout: 120000 });
        logger.info(`Clicking ${temporalFilter} button...`);
        await page.click(`button#${temporalFilter}`);
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
        await page.click('#table_primary thead th:nth-child(2)'); // Click to sort (ascending)
        await page.click('#table_primary thead th:nth-child(2)'); // Click twice to sort descending

        // Delay 3 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
    
        // Select the dropdown menu for page size and click on 'All'
        await page.click('.page-size'); 
        await page.waitForSelector('.dropdown-menu.show .dropdown-item'); // Wait for dropdown items to appear

        // Find the dropdown item with the text "All" and click it
        logger.debug('==> Finding the "All" dropdown item...');
        const allItemClicked = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.dropdown-menu.show .dropdown-item'));
            const allItem = items.find(item => item.textContent.trim() === 'All');
            if (allItem) {
                allItem.click();
                return true;
            }
            return false;
        });

        if (!allItemClicked) {
            throw new Error('Dropdown item "All" not found');
        }

        logger.debug('==> "All" dropdown item clicked');

        // Delay 5 seconds
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
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
                woreda: columns[3].textContent.trim(),      // Woreda
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
    XLSX.writeFile(workbook, xlsxFilename);

    logger.info(`Excel file saved to ${xlsxFilename}`);
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
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Woreda</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Kebele</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left;">Disease</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right;">Cases</th>
            </tr>
        </thead>
        <tbody>
            ${rowsToDisplay.map(row => `
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.type}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: left;">${row.woreda}</td>
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

async function extractGraphImage(graphImagePath) {
    let graphImageUrl = 'No data.';
    try {
        await stat(graphImagePath); // Check if the file exists
        const graphImageBase64 = fs.readFileSync(graphImagePath, { encoding: 'base64' });
        graphImageUrl = `<img src="data:image/png;base64,${graphImageBase64}" alt="Graph">`;
    } catch (err) {
        if (err.code !== 'ENOENT') {
            // Log other errors
            console.error(`Error accessing file ${graphImagePath}:`, err);
        }
    }
    return graphImageUrl;
}

async function extractMapImage(page) {
    const mapElement = await page.$('#mapid');
    const mapImagePath = path.join(__dirname, mapFilename);
    // Take a screenshot of the map
    await mapElement.screenshot({ path: mapFilename });
    // Convert the map image to a base64 data URL
    const mapImageBase64 = fs.readFileSync(mapImagePath, { encoding: 'base64' });
    const mapImageUrl = `<img src="data:image/png;base64,${mapImageBase64}" alt="Map">`;
    return mapImageUrl
}

async function sendEmailWithAttachments() {
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
        const mailOptions = {
            from: process.env.NODEMAIL_EMAIL,
            to: [process.env.NODEMAIL_RECIPIENTS],
            subject: emailSubject,
            text: emailBody,
            attachments: [
                {   // Attach PDF file
                    filename: pdfAttachment,
                    path: path.join(__dirname, pdfFilename)
                }
            ]
        };
        
        // Check if xlsx file exists and add to attachments if it does
        try {
            await stat(path.join(__dirname, xlsxFilename));
            mailOptions.attachments.push({
                filename: xlsxAttachment,
                path: path.join(__dirname, xlsxFilename)
            });
        } catch (err) {
            if (err.code !== 'ENOENT') {
                // Log other errors
                console.error(`Error accessing file ${xlsxFilename}:`, err);
            } else {
                logger.info('xlsx file does not exist, skipping attachment.');
            }
        }

        // Send email and await completion
        logger.info(`Sending email... `);
        let info = await transporter.sendMail(mailOptions);
        logger.info('Email sent successfully.');
        logger.debug('Email response:', info);

        return info;

    } catch (error) {
        logger.error('Error sending email:', error);
        throw error; // Propagate the error up
    }
}

app.get('/generate-pdf', async (req, res) => {
    const { url } = req.query;

    // Override global values with query parameters if provided
    if (req.query.templatePath) templatePath = req.query.templatePath;
    if (req.query.diseaseFilter) diseaseFilter = req.query.diseaseFilter;
    if (req.query.temporalFilter) temporalFilter = req.query.temporalFilter;
    if (req.query.emailSubject) emailSubject = req.query.emailSubject;
    if (req.query.emailBody) emailBody = req.query.emailBody;
    if (req.query.diseaseFilter || req.query.temporalFilter) {
        pdfAttachment = `report_${date}_${diseaseFilter}_${temporalFilter}.pdf`;
        xlsxAttachment = `data_${date}_${diseaseFilter}_${temporalFilter}.xlsx`;
    }
    
    // Generate PDF
    try {
        await generatePDFWithInteractions(req.query.url);
    
        // Check if the pdfFilename file exists
        try {
            await stat(pdfFilename);
        } catch (err) {
            logger.error('Error checking file:', err);
            res.status(500).send('Error checking file');
            return;
        }

        if (process.env.NODEMAIL_ACTIVE === 'true') {
            // Send email with attachments and await completion
            try {
                await sendEmailWithAttachments();

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
    } finally {
        // Delete generated files
        const files = [pdfFilename, xlsxFilename, mapFilename, graphFilename];
        for (const file of files) {
            try {
                await unlink(file);
            } catch (err) {
                logger.debug(`File ${file} was not created: nothing to delete.`);
            }
        }
    }
});

app.listen(port, () => {
    logger.info(`Puppeteer server listening at http://localhost:${port}`);
});
