const puppeteer = require('puppeteer');

async function debugHydration() {
  console.log('🔍 Starting headless browser hydration debugging...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs and errors
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type().toUpperCase()}] ${text}`);
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.error(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    console.log('📄 Loading /state-demo page...');
    
    // Navigate to the state demo page
    const response = await page.goto('http://localhost:3000/state-demo', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log(`📊 Response status: ${response.status()}`);
    
    // Wait a bit to let hydration complete and capture any errors
    await page.waitForTimeout(3000);
    
    // Check if page content loaded
    const pageContent = await page.content();
    const hasContent = pageContent.includes('State Management Demo');
    console.log(`📝 Page has expected content: ${hasContent}`);
    
    // Check for specific error indicators
    const hasLoadingFallback = pageContent.includes('Loading state management');
    console.log(`⏳ Shows loading fallback: ${hasLoadingFallback}`);
    
    // Try to interact with the page to trigger any additional errors
    console.log('🖱️  Attempting to interact with page elements...');
    
    try {
      // Look for buttons or interactive elements
      const buttons = await page.$$('button');
      console.log(`🔘 Found ${buttons.length} buttons`);
      
      if (buttons.length > 0) {
        await buttons[0].click();
        await page.waitForTimeout(1000);
      }
    } catch (interactionError) {
      console.error(`[INTERACTION ERROR] ${interactionError.message}`);
    }
    
    // Final wait to capture any delayed errors
    await page.waitForTimeout(2000);
    
    console.log('\n📋 SUMMARY:');
    console.log(`- Response Status: ${response.status()}`);
    console.log(`- Has Expected Content: ${hasContent}`);
    console.log(`- Shows Loading Fallback: ${hasLoadingFallback}`);
    console.log(`- Console Logs: ${logs.length}`);
    console.log(`- Page Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (logs.some(log => log.includes('ERROR') || log.includes('Warning'))) {
      console.log('\n⚠️  RELEVANT CONSOLE MESSAGES:');
      logs.filter(log => log.includes('ERROR') || log.includes('Warning') || log.includes('hydrat'))
           .forEach(log => console.log(`   ${log}`));
    }
    
  } catch (error) {
    console.error(`[NAVIGATION ERROR] ${error.message}`);
  } finally {
    await browser.close();
  }
}

debugHydration().catch(console.error); 