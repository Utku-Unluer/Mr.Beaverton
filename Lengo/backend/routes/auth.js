const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/db');

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }
    
    // Check if user exists
    const users = await executeQuery(`
      SELECT id, username, email, name, createdAt, streak, lastActive
      FROM Users
      WHERE email = @email AND password = @password
    `, { email, password });
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    const user = users[0];
    
    // Update last active
    await executeQuery(`
      UPDATE Users
      SET lastActive = GETDATE()
      WHERE id = @userId
    `, { userId: user.id });
    
    // Return user data
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        streak: user.streak,
        lastActive: user.lastActive
      },
      token: 'dummy-token-' + user.id // In a real app, generate a JWT token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Validate input
    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }
    
    // Check if user already exists
    const existingUsers = await executeQuery(`
      SELECT id FROM Users
      WHERE email = @email OR username = @username
    `, { email, username });
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
    }
    
    // Create new user
    const result = await executeQuery(`
      INSERT INTO Users (username, email, password, name)
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.name, INSERTED.createdAt
      VALUES (@username, @email, @password, @name)
    `, { username, email, password, name });
    
    const newUser = result[0];
    
    // Return new user data
    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
        streak: 0,
        lastActive: newUser.createdAt
      },
      token: 'dummy-token-' + newUser.id // In a real app, generate a JWT token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'E-posta gereklidir' });
    }
    
    // Check if user exists
    const users = await executeQuery(`
      SELECT id FROM Users
      WHERE email = @email
    `, { email });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' });
    }
    
    // In a real app, send password reset email
    // For demo, just reset to a default password
    await executeQuery(`
      UPDATE Users
      SET password = 'resetpass123'
      WHERE email = @email
    `, { email });
    
    return res.status(200).json({ message: 'Şifre sıfırlama başarılı' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
