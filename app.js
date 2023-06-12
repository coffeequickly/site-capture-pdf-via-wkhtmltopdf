const puppeteer = require('puppeteer-extra');
const express = require('express');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const app = express();
const port = process.env.PORT || 3000;

puppeteer.use(StealthPlugin());

app.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send({ error: 'Missing url' });
  }

  console.info(`Requesting ${url}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    );

    await page.setExtraHTTPHeaders({
      'ngrok-skip-browser-warning': 'ok',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15 * 1000 });

    // additional wait 5 seconds
    new Promise((r) => setTimeout(r, 10000));

    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });
    res.send(pdf);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({ error: JSON.stringify(error) });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
