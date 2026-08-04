import http from 'http';

const data = JSON.stringify({
  name: 'test-product',
  category: 'Dry Fruits',
  price: 100,
  description: 'test',
  unit: 'gm',
  unitValue: 800
});

const options = {
  hostname: 'localhost',
  port: 7052,
  path: '/api/products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let resData = '';
  res.on('data', (chunk) => {
    resData += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', resData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
