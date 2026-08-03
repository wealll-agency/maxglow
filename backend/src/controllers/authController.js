import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { logActivity } from '../middleware/logger.js';
import jwt from 'jsonwebtoken';
import SystemSetting from '../models/SystemSetting.js';

import { performSync } from './userController.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  let { name, email, password, phone, localCart = [], localWishlist = [] } = req.body;
  if (email) email = email.toLowerCase().trim();

  try {
    if (password && password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // First user is Super Admin
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'Super Admin' : 'Customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    if (user) {
      const token = generateToken(res, user._id);
      await logActivity(user._id, 'REGISTER', `User successfully registered with email: ${email}`, req);

      let syncedData = { cart: [], wishlist: [] };
      if (localCart.length > 0 || localWishlist.length > 0) {
        syncedData = await performSync(user._id, localCart, localWishlist);
      }

      res.status(201).json({
        success: true,
        token,
        cart: syncedData.cart,
        wishlist: syncedData.wishlist,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses || [],
          permissions: user.permissions instanceof Map ? Object.fromEntries(user.permissions) : (user.permissions || {})
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  let { email, password, rememberMe, localCart = [], localWishlist = [] } = req.body;
  if (email) email = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id, rememberMe !== false);
      await logActivity(user._id, 'LOGIN', `User logged in`, req);

      let syncedData = { cart: [], wishlist: [] };
      if (localCart.length > 0 || localWishlist.length > 0) {
        syncedData = await performSync(user._id, localCart, localWishlist);
      } else {
        // Just fetch them if not syncing
        syncedData = await performSync(user._id, [], []);
      }

      res.json({
        success: true,
        token,
        cart: syncedData.cart,
        wishlist: syncedData.wishlist,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          permissions: user.permissions instanceof Map ? Object.fromEntries(user.permissions) : user.permissions
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity(req.user._id, 'LOGOUT', `User logged out`, req);
    }
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(process.env.NODE_ENV === 'production' && { domain: process.env.COOKIE_DOMAIN || '.maxglow.in' }),
      expires: new Date(0)
    };
    res.cookie('token', '', cookieOptions);
    res.cookie('refreshToken', '', cookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshTokenUser = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise');
    let user;
    try {
      user = await User.findById(decoded.id);
    } catch (dbError) {
      console.error(`Database error during refresh token verification: ${dbError.message}`);
      return res.status(500).json({ success: false, message: 'Internal server error, database connection failure' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_maxglow_2026_enterprise',
      { expiresIn: '7d' }
    );

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, token: accessToken });
  } catch (error) {
    console.error(`Refresh token error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid refresh token' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

const migrateLegacyAddresses = (user) => {
  if (user && user.addresses && user.addresses.length > 0) {
    user.addresses.forEach(addr => {
      if (!addr.name) addr.name = user.name || 'Resident';
      if (!addr.phone) addr.phone = user.phone || '0000000000';
      if (!addr.pincode) addr.pincode = '000000';
      if (!addr.locality) addr.locality = 'N/A';
      if (!addr.address) addr.address = 'N/A';
      if (!addr.city) addr.city = 'N/A';
      if (!addr.state) addr.state = 'N/A';
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.alternatePhone = req.body.alternatePhone !== undefined ? req.body.alternatePhone : user.alternatePhone;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;

      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        user.password = req.body.password;
      }

      migrateLegacyAddresses(user);
      const updatedUser = await user.save();
      await logActivity(user._id, 'UPDATE_PROFILE', `User updated profile settings`, req);

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          alternatePhone: updatedUser.alternatePhone,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          role: updatedUser.role,
          addresses: updatedUser.addresses
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update FCM Token for Push Notifications
// @route   POST /api/auth/fcm-token
// @access  Private
export const updateFcmToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.json({ success: true, message: 'FCM Token registered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address to profile
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone, addressType, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const shouldBeDefault = isDefault || user.addresses.length === 0;

    if (shouldBeDefault && user.addresses.length > 0) {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          addresses: {
            name, phone, pincode, locality, address, city, state, landmark, alternatePhone, addressType, 
            isDefault: shouldBeDefault 
          }
        }
      },
      { new: true }
    );

    await logActivity(user._id, 'ADD_ADDRESS', `Added address for: ${name}`, req);
    res.status(201).json({ success: true, addresses: updatedUser.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address in profile
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone, addressType, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) return res.status(404).json({ success: false, message: 'Address not found' });

    if (isDefault) {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const setQuery = {};
    if (name) setQuery[`addresses.${addressIndex}.name`] = name;
    if (phone) setQuery[`addresses.${addressIndex}.phone`] = phone;
    if (pincode) setQuery[`addresses.${addressIndex}.pincode`] = pincode;
    if (locality) setQuery[`addresses.${addressIndex}.locality`] = locality;
    if (address) setQuery[`addresses.${addressIndex}.address`] = address;
    if (city) setQuery[`addresses.${addressIndex}.city`] = city;
    if (state) setQuery[`addresses.${addressIndex}.state`] = state;
    if (landmark !== undefined) setQuery[`addresses.${addressIndex}.landmark`] = landmark;
    if (alternatePhone !== undefined) setQuery[`addresses.${addressIndex}.alternatePhone`] = alternatePhone;
    if (addressType) setQuery[`addresses.${addressIndex}.addressType`] = addressType;
    if (isDefault !== undefined) setQuery[`addresses.${addressIndex}.isDefault`] = isDefault;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: setQuery },
      { new: true }
    );

    await logActivity(req.user._id, 'UPDATE_ADDRESS', `Updated address ID: ${req.params.id}`, req);
    res.json({ success: true, addresses: updatedUser.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address from profile
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: req.params.id } } },
      { new: true }
    );

    if (updatedUser) {
      await logActivity(req.user._id, 'DELETE_ADDRESS', `Deleted address ID: ${req.params.id}`, req);
      res.json({ success: true, addresses: updatedUser.addresses });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

let cachedSettings = null;
let settingsCacheTime = 0;
const SETTINGS_CACHE_TTL = 60 * 1000; // 1 minute cache TTL

// @desc    Get system settings
// @route   GET /api/auth/settings
// @access  Public
export const getSystemSettings = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (cachedSettings && (Date.now() - settingsCacheTime < SETTINGS_CACHE_TTL)) {
      return res.json({
        success: true,
        settings: cachedSettings
      });
    }

    const keys = ['cod', 'refund', 'topSellingSource', 'media_hero', 'media_new_arrivals', 'media_offers', 'media_category_banner', 'media_category_banners', 'media_reels'];
    const docs = await SystemSetting.find({ key: { $in: keys } }).lean();
    const map = new Map(docs.map(d => [d.key, d.value]));

    const settings = {
      cod: map.has('cod') ? map.get('cod') : true,
      refund: map.has('refund') ? map.get('refund') : true,
      topSellingSource: map.has('topSellingSource') ? map.get('topSellingSource') : 'automatic',
      media_hero: map.has('media_hero') ? map.get('media_hero') : null,
      media_new_arrivals: map.has('media_new_arrivals') ? map.get('media_new_arrivals') : null,
      media_offers: map.has('media_offers') ? map.get('media_offers') : null,
      media_category_banner: map.has('media_category_banner') ? map.get('media_category_banner') : null,
      media_category_banners: map.has('media_category_banners') ? map.get('media_category_banners') : {},
      media_reels: map.has('media_reels') ? map.get('media_reels') : null,
    };

    cachedSettings = settings;
    settingsCacheTime = Date.now();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/auth/settings
// @access  Private/Admin
export const updateSystemSettings = async (req, res, next) => {
  const { settings } = req.body;
  console.log('updateSystemSettings called! body settings:', settings);

  try {
    if (settings && typeof settings === 'object') {
      const keysToUpdate = [
        { key: 'cod', type: 'boolean' },
        { key: 'refund', type: 'boolean' },
        { key: 'topSellingSource', type: 'string' },
        { key: 'media_hero', type: 'array' },
        { key: 'media_new_arrivals', type: 'string' },
        { key: 'media_offers', type: 'array' },
        { key: 'media_category_banner', type: 'string' },
        { key: 'media_category_banners', type: 'object' },
        { key: 'media_reels', type: 'array' }
      ];

      for (const field of keysToUpdate) {
        if (settings[field.key] !== undefined) {
          let valueToSave = settings[field.key];
          if (field.type === 'boolean') valueToSave = Boolean(settings[field.key]);
          if (field.type === 'string') valueToSave = String(settings[field.key]);
          if (field.type === 'array') valueToSave = Array.isArray(settings[field.key]) ? settings[field.key] : [];
          if (field.type === 'object') valueToSave = typeof settings[field.key] === 'object' && settings[field.key] !== null ? settings[field.key] : {};

          await SystemSetting.findOneAndUpdate(
            { key: field.key },
            { value: valueToSave },
            { upsert: true, new: true }
          );
        }
      }
    }

    // Invalidate in-memory cache immediately on settings update
    cachedSettings = null;
    settingsCacheTime = 0;

    await logActivity(req.user._id, 'UPDATE_SYSTEM_SETTINGS', `Updated global access settings`, req);

    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
