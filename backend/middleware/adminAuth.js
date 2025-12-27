const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // Check if user is an admin
    if (decoded.role !== 'admin' && !decoded.adminId) {
      console.error('Admin auth failed: Token missing admin role or adminId');
      console.error('Token payload:', JSON.stringify(decoded, null, 2));
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Token verification failed' });
  }
};

module.exports = {
  authenticateAdmin
};

