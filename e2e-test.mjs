import { chromium } from 'playwright';
// FIX: Import 'process' to make it available in the ES module scope.
import process from 'process';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to test page...');
    await page.goto('http://localhost:3000/#/tests');
    
    // Wait for the summary to be rendered, with a generous timeout.
    console.log('Waiting for test summary...');
    await page.waitForSelector('text=Summary', { timeout: 90000 });
    
    // Wait for the "Failed" count to appear.
    const failedCountElement = await page.waitForSelector('div.text-red-400 > p.text-3xl', { timeout: 10000 });
    const failedCount = await failedCountElement.textContent();
    
    console.log(`Test run complete. Found ${failedCount} failed tests.`);

    if (parseInt(failedCount.trim(), 10) !== 0) {
      console.error('Tests failed!');
      // Get more details about failures
      const failedTests = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.bg-red-500\\/10'))
          .map(el => {
              const suiteEl = el.closest('div.mb-4')?.querySelector('h3');
              const testEl = el.querySelector('p.font-medium');
              return `[${suiteEl?.textContent || 'Unknown Suite'}] ${testEl?.textContent || 'Unknown Test'}`;
          })
          .filter(Boolean);
      });
      console.error('Failed tests:\n- ' + failedTests.join('\n- '));
      process.exit(1);
    } else {
      console.log('All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running E2E tests:', error);
    await page.screenshot({ path: 'e2e-error-screenshot.png', fullPage: true });
    console.log('Screenshot of the error has been saved to e2e-error-screenshot.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();