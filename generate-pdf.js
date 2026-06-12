const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  const htmlPath = 'file://' + path.resolve(__dirname, 'DOCUMENTATION.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.pdf({
    path: 'DOCUMENTATION.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });
  await browser.close();
  console.log('Done: DOCUMENTATION.pdf');
})();
