import jwt from 'jsonwebtoken';

const generateToken = (res, userId, rememberMe = true, role = 'Customer') => {
  const isAdmin = role !== 'Customer';
  const tokenExpiration = '365d'; // Keep admin logged in as requested
  
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise',
    { expiresIn: tokenExpiration }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise',
    { expiresIn: tokenExpiration }
  );

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd || process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    ...(isProd && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
  };

  const maxAgeMs = 365 * 24 * 60 * 60 * 1000;
  res.cookie('token', accessToken, { ...cookieOptions, maxAge: maxAgeMs });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: maxAgeMs });

  return accessToken;
};

export default generateToken;
