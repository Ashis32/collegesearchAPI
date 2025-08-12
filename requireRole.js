const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKey'; // Use environment variable for production

function requireRole(roles) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
      }
      req.adminId = decoded.adminId;
      req.role = decoded.role;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
}

module.exports = requireRole;
