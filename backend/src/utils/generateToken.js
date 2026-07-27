import jwt from 'jsonwebtoken';

const generateToken = (res, userId, rememberMe = true) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise',
    { expiresIn: rememberMe ? '7d' : '1d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise',
    { expiresIn: rememberMe ? '30d' : '1d' }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    ...(process.env.NODE_ENV === 'production' && { domain: '.maxglowon.com' })
  };

  if (rememberMe) {
    res.cookie('token', accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  } else {
    res.cookie('token', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }

  return accessToken;
};

export default generateToken;
