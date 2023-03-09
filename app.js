const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const port = 3000;

const config = {
    "timeout": 30000,
    "userAgent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
}

app.get('/pdf', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send('Missing url parameter');
    } else {
        const fullUrl = /^https?:\/\//i.test(url) ? url : `http://${url}`; // 프로토콜이 포함되어 있지 않은 경우 http://를 추가
        console.log(`PDF Maker Requested ${fullUrl}`);

        let fileDomain = '';
        try {
            fileDomain = new URL(fullUrl).hostname; // 수정: fullUrl을 사용하도록 수정
        } catch (error) {
            console.error(`Invalid URL: ${fullUrl}`); // 수정: fullUrl을 사용하도록 수정
            res.status(400).send('Invalid URL');
            return;
        }
        const fileName = `${Date.now()}_${fileDomain}.pdf`;
        const timeoutId = setTimeout(() => {
            console.error('Request timed out');
            res.status(408).send('Request timed out');
        }, config.timeout);

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', // Chromium 실행 파일 경로
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent(config.userAgent);
        await page.goto(fullUrl, { waitUntil: 'networkidle0' });
        await page.pdf({ path: fileName, format: 'A4' });

        clearTimeout(timeoutId);
        res.download(fileName, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
            } else {
                console.log(`File sent: ${fileName}`);
            }
            browser.close();
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
