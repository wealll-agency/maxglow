import Log from '../models/Log.js';

export const logActivity = async (userId, action, details, req) => {
  try {
    let userName = 'System';
    let userEmail = 'system@maxglow.com';
    let role = 'System';

    if (userId) {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        userName = user.name;
        userEmail = user.email;
        role = user.role;
      }
    }

    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1';
    const userAgent = req ? req.headers['user-agent'] : 'System-Triggered';

    await Log.create({
      userId,
      userName,
      userEmail,
      role,
      action,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error(`Activity logging failed: ${error.message}`);
  }
};

export const auditRoute = (actionName) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // Only log successful modifications or actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user._id : null;
        const details = `Method: ${req.method}, Path: ${req.originalUrl}, Body: ${JSON.stringify(req.body)}`;
        await logActivity(userId, actionName, details, req);
      }
    });
    next();
  };
};
