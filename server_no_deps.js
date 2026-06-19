const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

function sendJSON(res, status, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(s);
}

function saveSubmission(sub) {
  let arr = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      arr = JSON.parse(raw || '[]');
    }
  } catch (err) {
    console.error('Failed reading submissions file', err);
  }
  arr.push({ ...sub, receivedAt: new Date().toISOString() });
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed saving submission', err);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/inquiry') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const { name, email } = data;
        if (!name || !email) return sendJSON(res, 400, { success: false, message: 'Name and email required' });
        saveSubmission(data);
        return sendJSON(res, 200, { success: true, message: 'Inquiry received' });
      } catch (err) {
        console.error('Invalid JSON', err);
        return sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
    return;
  }

  // root
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Suit Vault backend (no-deps)');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`No-deps server listening on http://localhost:${PORT}`));
