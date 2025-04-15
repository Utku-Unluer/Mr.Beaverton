const userModel = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const { isValidEmail, isStrongPassword, sanitizeUser, createError } = require('../utils/helpers');

// Auth controller
const authController = {
  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw createError('ValidationError', 'Email ve şifre gereklidir');
      }

      // Check if email is valid
      if (!isValidEmail(email)) {
        throw createError('ValidationError', 'Geçersiz email formatı');
      }

      // Check if user exists
      const user = await userModel.getByEmail(email);

      if (!user) {
        throw createError('UnauthorizedError', 'Geçersiz e-posta veya şifre');
      }

      // Check if password is correct
      if (user.password !== password) {
        throw createError('UnauthorizedError', 'Geçersiz e-posta veya şifre');
      }

      // Update last active
      await userModel.updateLastActive(user.id);

      // Generate token
      const token = generateToken(user);

      // Return user data (without password)
      res.status(200).json({
        user: sanitizeUser(user),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Register
  async register(req, res, next) {
    try {
      const { username, email, password, name } = req.body;

      // Validate input
      if (!username || !email || !password || !name) {
        throw createError('ValidationError', 'Tüm alanlar gereklidir');
      }

      // Check if email is valid
      if (!isValidEmail(email)) {
        throw createError('ValidationError', 'Geçersiz email formatı');
      }

      // Check if password is strong enough
      if (!isStrongPassword(password)) {
        throw createError('ValidationError', 'Şifre en az 6 karakter olmalıdır');
      }

      // Create new user
      const newUser = await userModel.create({ username, email, password, name });

      // Generate token
      const token = generateToken(newUser);

      // Return user data (without password)
      res.status(201).json({
        user: sanitizeUser(newUser),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        throw createError('ValidationError', 'E-posta gereklidir');
      }

      // Check if email is valid
      if (!isValidEmail(email)) {
        throw createError('ValidationError', 'Geçersiz email formatı');
      }

      // Check if user exists
      const user = await userModel.getByEmail(email);
      const userExists = !!user;

      if (!userExists) {
        throw createError('NotFoundError', 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı');
      }

      // In a real app, send password reset email
      // For demo, just reset to a default password
      const newPassword = 'resetpass123';

      // Update password
      await userModel.updatePassword(email, newPassword);

      res.status(200).json({ message: 'Şifre sıfırlama başarılı' });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      // In a real app, invalidate token
      // For demo, just return success
      res.status(200).json({ message: 'Çıkış başarılı' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
