exports.handler = async (event) => {
  try {
    const jwt = require('jsonwebtoken');
    const body = JSON.parse(event.body || '{}');
    const sub = body.userId || body.email || body.username || '1';
    const token = jwt.sign({ sub }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify({ token, user: { sub } })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
