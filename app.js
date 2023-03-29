const express = require('express');
const { Cluster } = require('puppeteer-cluster');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = 3000;

const config = {
  timeout: 60000,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  maxConcurrency: 4,
};


(async () => {
  const cluster = await Cluster.launch({
    puppeteerOptions: {
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox'],
    },
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: config.maxConcurrency,
  });


  await cluster.task(async ({ page, data }) => {
    await page.setUserAgent(config.userAgent);
    await page.goto(data, { waitUntil: 'networkidle0', timeout: config.timeout });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    return pdfBuffer;
  });


  async function updateMetadata(buffer) {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      pdfDoc.setProducer('Your Custom Application Name');
      pdfDoc.setCreator('Your Custom Application Name');
      return pdfDoc.save();
    } catch (error) {
      console.error('Error updating metadata:', error);
      return buffer; // 원본 버퍼를 반환하여 최소한 원본 PDF를 전송하십시오.
    }
  }


  app.get('/pdf', async (req, res) => {

    const url = req.query.url;
    if (!url) {
      res.status(400).send('Missing url parameter');
      return;
    }

    const fullUrl = /^https?:\/\//i.test(url) ? url : `http://${url}`;
    console.log(`PDF Maker Requested ${fullUrl}`);

    let fileDomain = '';
    try {
      fileDomain = new URL(fullUrl).hostname;
    } catch (error) {
      console.error(`Invalid URL: ${fullUrl}`);
      res.status(400).send('Invalid URL');
      return;
    }


    const fileName = `${Date.now()}_${fileDomain}.pdf`;
    const timeoutId = setTimeout(() => {
      console.error('Request timed out');
      res.status(408).send('Request timed out');
    }, config.timeout);

    const pdfBuffer = await cluster.execute(fullUrl);


    clearTimeout(timeoutId);

    if (pdfBuffer) {
      const modifiedPdfBytes = await updateMetadata(pdfBuffer);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}`);
      res.setHeader('Content-Type', 'application/pdf');
      const chunkSize = 2000000; // 2MB

      if (modifiedPdfBytes.byteLength > chunkSize) {
        const totalChunks = Math.ceil(modifiedPdfBytes.byteLength / chunkSize);

        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', modifiedPdfBytes.byteLength);
        res.setHeader('Content-Range', `bytes 0-${modifiedPdfBytes.byteLength - 1}/${modifiedPdfBytes.byteLength}`);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = (i + 1) * chunkSize;
          const chunk = modifiedPdfBytes.slice(start, end);
          res.write(chunk);
        }
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(modifiedPdfBytes);
      }
    } else {
      res.status(500).send('Error generating PDF');
    }
  });

  app.listen(port, () => {
      console.log(`PDF Maker listening at http://localhost:${port}`);
    },
  );

  process.on('SIGINT', async () => {
    console.log('Closing browser cluster...');
    await cluster.close();
    console.log('Browser cluster closed. Exiting...');
    process.exit(0);
  });
})();