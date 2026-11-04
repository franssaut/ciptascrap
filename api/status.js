const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tmpStatus = '/tmp/sync_status.json';
  const localStatus = path.join(process.cwd(), 'sync_status.json');

  let data = null;
  if (fs.existsSync(tmpStatus)) {
    try {
      data = JSON.parse(fs.readFileSync(tmpStatus, 'utf-8'));
    } catch (e) {}
  }
  if (!data && fs.existsSync(localStatus)) {
    try {
      data = JSON.parse(fs.readFileSync(localStatus, 'utf-8'));
    } catch (e) {}
  }

  if (!data) {
    data = {
      status: 'idle',
      message: 'Serverless function siap.',
      engine: 'Vercel Serverless'
    };
  }

  data.auto_interval = 'Harian (Setiap Hari jam 07:00 WIB via Vercel Cron)';
  data.environment = 'Vercel Edge / Serverless';

  return res.status(200).json(data);
};
