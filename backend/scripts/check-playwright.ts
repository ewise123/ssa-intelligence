import { chromium } from 'playwright';

const run = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  await browser.newPage();
  await browser.close();
};

run()
  .then(() => {
    console.log('Playwright launch OK');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Playwright launch failed:', error);
    process.exit(1);
  });
