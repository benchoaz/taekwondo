import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env.local', 'utf8');
const cronSecret = env.split('\n').find(l => l.startsWith('CRON_SECRET='))?.split('=')[1]?.replace(/"/g, '');

console.log('Found secret:', !!cronSecret);

fetch('https://taekwondo-by98.vercel.app/api/cron/fetch-events', {
  headers: { 'Authorization': `Bearer ${cronSecret}` }
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Fetch error:', err));
