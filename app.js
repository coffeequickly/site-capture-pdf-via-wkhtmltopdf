const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send({ error: 'Missing url' });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });
  res.send(pdf);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
