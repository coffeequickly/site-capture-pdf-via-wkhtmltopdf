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
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--headless',
      '--hide-scrollbars',
      '--disable-features=TranslateUI',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-sync',
      '--metrics-recording-only',
      '--disable-default-apps',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--force-fieldtrials=*BackgroundTracing/default/',
    ],
  });

  // TODO : 비밀번호 추가, PDF 정보 수정 등 부가기능 추가.

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
