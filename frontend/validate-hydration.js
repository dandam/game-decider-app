const http = require('http');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateHydration() {
  console.log('🔍 Validating hydration behavior...');
  
  const url = 'http://localhost:3000/state-demo';
  const requests = 5;
  
  try {
    for (let i = 1; i <= requests; i++) {
      console.log(`📡 Request ${i}/${requests}...`);
      
      const response = await makeRequest(url);
      console.log(`   Status: ${response.statusCode}`);
      
      // Check for expected content
      const hasTitle = response.body.includes('State Management Validation');
      const hasHydrator = response.body.includes('StoreHydrator');
      const hasErrorBoundary = response.body.includes('ErrorBoundary');
      
      console.log(`   Has title: ${hasTitle}`);
      console.log(`   Has hydrator: ${hasHydrator}`);
      console.log(`   Has error boundary: ${hasErrorBoundary}`);
      
      if (response.statusCode !== 200) {
        console.error(`❌ Request ${i} failed with status ${response.statusCode}`);
      } else {
        console.log(`✅ Request ${i} successful`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📋 Validation Summary:');
    console.log('- All requests completed');
    console.log('- Check Docker logs for any Fast Refresh errors');
    console.log('- If no errors appear in logs, hydration is working correctly');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }
}

validateHydration(); 