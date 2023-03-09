const express = require('express');
const { exec } = require('child_process');
const config = require('./configure.json');

const app = express();
const port = 3000;

app.get('/pdf', (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send('Missing url parameter');
    } else {
        const fileName = config.fileNamePattern.replace('{timestamp}', Date.now());
        const command = `wkhtmltopdf ${url} ${fileName}`;
        const timeoutId = setTimeout(() => {
            console.error('Request timed out');
            res.status(408).send('Request timed out');
        }, config.timeout);

        exec(command, (error, stdout, stderr) => {
            clearTimeout(timeoutId);
            if (error) {
                console.error(`exec error: ${error}`);
                res.status(500).send(`Error generating PDF: ${error}`);
            } else {
                res.download(fileName, (err) => {
                    if (err) {
                        console.error(`Error sending file: ${err}`);
                    } else {
                        console.log(`File sent: ${fileName}`);
                    }
                    exec(`rm ${fileName}`);
                });
            }
        });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});