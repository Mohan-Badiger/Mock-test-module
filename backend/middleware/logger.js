// Request logging middleware
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger;

