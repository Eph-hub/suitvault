const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'submissions.json');

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

app.post('/api/inquiry', (req, res) => {
  const { name, email, phone, interest, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }
  const submission = { name, email, phone: phone || '', interest: interest || 'General Inquiry', message: message || '' };
  saveSubmission(submission);
  return res.json({ success: true, message: 'Inquiry received. We will contact you shortly.' });
});

app.get('/', (req, res) => res.send('Suit Vault backend running'));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
