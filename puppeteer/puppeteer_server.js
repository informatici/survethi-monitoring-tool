const express = require('express');
const puppeteer = require('puppeteer');

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

        // Wait for any resulting actions to complete if necessary
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 10000))); // Wait for 10 seconds

        // Generate PDF
        console.log(`Generating: ${outputPath}`);
        await page.pdf({ path: outputPath, format: 'A4' });

        console.log(`PDF generated successfully at ${outputPath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        await browser.close();
    }
}

async function generatePDF(url, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
        protocolTimeout: 60000 // Set the protocol timeout to 60 seconds
    });
    const page = await browser.newPage();

    console.log(`Accessing: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
    console.log(`Generating: ${outputPath}`);
    await page.pdf({ path: outputPath, format: 'A4' });

    await browser.close();
}

app.get('/generate-pdf', async (req, res) => {
    const { url } = req.query;
    const outputPath = 'generated.pdf'; // Change as needed

    try {
        //await generatePDF(url, outputPath);
        await generatePDFWithInteractions(url, outputPath);
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
