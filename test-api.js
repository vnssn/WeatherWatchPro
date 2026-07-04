// Simple script to test the API endpoint
import https from 'https';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      // Handle redirects (status codes 301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirecting to: ${res.headers.location}`);
        
        // Parse the redirect URL
        const redirectUrl = new URL(res.headers.location);
        
        // Create new options for the redirect
        const redirectOptions = {
          hostname: redirectUrl.hostname,
          port: 443, // HTTPS
          path: redirectUrl.pathname + redirectUrl.search,
          method: options.method,
          headers: options.headers
        };
        
        // Follow the redirect
        return resolve(makeRequest(redirectOptions, data));
      }
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testApi() {
  const hostname = 'weatherwatchpro-lkqrb2gq4-webrookie0s-projects.vercel.app';
  const basePath = '/api/weather';
  
  const testData = {
    device_id: 'TEST_DEVICE_' + Date.now(),
    temperature_dht: 55.0,
    humidity: 90.0,
    signal_strength: -50,
    uptime: 'test uptime ' + new Date().toISOString(),
    temperature_bmp: 24.8,
    pressure: 1012.5
  };
  
  console.log('Sending test data:', testData);
  
  const postData = JSON.stringify(testData);
  
  const postOptions = {
    hostname: hostname,
    port: 443, // HTTPS
    path: basePath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  try {
    // Send POST request
    const postResponse = await makeRequest(postOptions, postData);
    console.log('POST Status code:', postResponse.statusCode);
    console.log('POST Response data:', postResponse.data);
    
    // Get current data
    console.log('\nFetching current data...');
    const getOptions = {
      hostname: hostname,
      port: 443, // HTTPS
      path: basePath + '/current',
      method: 'GET'
    };
    
    const getCurrentResponse = await makeRequest(getOptions);
    console.log('GET Status code:', getCurrentResponse.statusCode);
    console.log('GET Response data:', getCurrentResponse.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi(); 