const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send({ error: 'Missing url' });
  }

  console.info(`Requesting ${url}`);

  try {
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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'ngrok-skip-browser-warning': 'true'
    });


    await page.goto(url, { waitUntil: 'networkidle2' });

    // 폰트 렌더링 대기
    await page.evaluate(async () => {
      const fontFaces = Array.from(document.fonts.values());
      await Promise.all(fontFaces.map(font => font.load()));
    });

    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });
    res.send(pdf);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
