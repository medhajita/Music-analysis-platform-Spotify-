/**
 * @desc    Logs each request with method, URL, and duration in ms
 */
const logRequests = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = { logRequests };
