const { supabase } = require('../config/db');
const { createError } = require('../utils/helpers');

// User model
const userModel = {
  // Get user by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('id, username, email, name, created_at, streak, last_active')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Convert column names to match our API
      if (data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name,
          createdAt: data.created_at,
          streak: data.streak,
          lastActive: data.last_active
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  async getByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('id, username, email, name, password, created_at, streak, last_active')
        .eq('email', email)
        .single();

      if (error) throw error;

      // Convert column names to match our API
      if (data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name,
          password: data.password,
          createdAt: data.created_at,
          streak: data.streak,
          lastActive: data.last_active
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Get user by username
  async getByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('id, username, email, name, password, created_at, streak, last_active')
        .eq('username', username)
        .single();

      if (error) throw error;

      // Convert column names to match our API
      if (data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name,
          password: data.password,
          createdAt: data.created_at,
          streak: data.streak,
          lastActive: data.last_active
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  // Create new user
  async create(userData) {
    try {
      const { username, email, password, name } = userData;

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('Users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingUser) {
        throw createError('ValidationError', 'Bu e-posta veya kullanıcı adı zaten kullanılıyor');
      }

      // Create new user
      const { data, error } = await supabase
        .from('Users')
        .insert([
          {
            username,
            email,
            password,
            name,
            streak: 0,
            last_active: new Date().toISOString()
          }
        ])
        .select('id, username, email, name, created_at, streak, last_active')
        .single();

      if (error) throw error;

      // Convert column names to match our API
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name,
        createdAt: data.created_at,
        streak: data.streak,
        lastActive: data.last_active
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user's last active time
  async updateLastActive(userId) {
    try {
      const { error } = await supabase
        .from('Users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating last active time:', error);
      throw error;
    }
  },

  // Update user's password
  async updatePassword(email, newPassword) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .update({ password: newPassword })
        .eq('email', email);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
};

module.exports = userModel;
