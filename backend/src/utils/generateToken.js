import jwt from 'jsonwebtoken';

const generateToken = (res, userId, rememberMe = true, role = 'Customer') => {
  const isAdmin = role !== 'Customer';
  const tokenExpiration = isAdmin ? '7d' : '100y';
  
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

  const isProd = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(isProd && { domain: process.env.COOKIE_DOMAIN || '.maxglow.in' })
  };

  const maxAgeMs = isAdmin ? 7 * 24 * 60 * 60 * 1000 : 100 * 365 * 24 * 60 * 60 * 1000;
  res.cookie('token', accessToken, { ...cookieOptions, maxAge: maxAgeMs });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: maxAgeMs });

  return accessToken;
};

export default generateToken;
