import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Clean up expired cache every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      userCache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref(); // unref prevents this interval from keeping the process alive

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise');
    
    const cachedUser = userCache.get(decoded.id);
    if (cachedUser && (Date.now() - cachedUser.timestamp < CACHE_TTL)) {
      req.user = cachedUser.data;
    } else {
      let user;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbError) {
        console.error(`Database error during auth verification: ${dbError.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error, database connection failure' });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      userCache.set(decoded.id, { data: user, timestamp: Date.now() });
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error(`JWT validation error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Super Admin is always authorized
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'Super Admin' && req.user.role !== 'Admin')) {
      return res.status(403).json({ // 403 Forbidden
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`
      });
    }
    next();
  };
};
