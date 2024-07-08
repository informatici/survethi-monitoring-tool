const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

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
    const outputPath = 'generated_pdf.pdf'; // Change as needed

    try {
        await generatePDF(url, outputPath);
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
