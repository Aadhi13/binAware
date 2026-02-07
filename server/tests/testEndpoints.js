const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const endpoints = [
    {
        name: 'Root',
        path: '/',
        method: 'GET',
        expected: 'Hello World!'
    },
    {
        name: 'Register',
        path: '/api/auth/register',
        method: 'POST',
        expected: 'Register Endpoint'
    },
    {
        name: 'Login',
        path: '/api/auth/login',
        method: 'POST',
        expected: 'Login Endpoint'
    }
];

function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (endpoint.method === 'POST') {
            req.write(JSON.stringify({}));
        }

        req.end();
    });
}

async function runTests() {
    console.log(`Starting API tests on ${BASE_URL}...\n`);

    let passed = 0;
    let failed = 0;

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
            const response = await makeRequest(endpoint);

            if (response.data.includes(endpoint.expected)) {
                console.log(`✅ Passed: Got expected response "${endpoint.expected}"`);
                passed++;
            } else {
                console.log(`❌ Failed: Expected "${endpoint.expected}", got "${response.data}"`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ Failed: Connection error - ${error.message}`);
            failed++;
        }
        console.log('---');
    }

    console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests();
