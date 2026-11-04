const { runSync } = require('../sync');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await runSync();
    return res.status(200).json({
      status: result.success ? 'success' : 'error',
      message: result.status?.message || result.error || 'Sinkronisasi selesai.',
      error: result.error || null,
      last_sync: result.status?.last_sync_formatted,
      total_projects: result.status?.total_projects,
      total_units: result.status?.total_units,
      elapsed_seconds: result.status?.elapsed_seconds,
      engine: 'Vercel Serverless Function (Node.js)',
      data: result.data || null
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
