const { supabase } = require('../config/db');
const { createError } = require('../utils/helpers');

// List model
const listModel = {
  // Get all lists
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('WordLists')
        .select('id, name, description, context, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format lists without word count
      const lists = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        context: item.context,
        createdAt: item.created_at,
        wordCount: 0 // Varsayılan olarak 0 kullan
      }));

      return lists;
    } catch (error) {
      console.error('Error getting all lists:', error);
      throw error;
    }
  },
  // Get all lists for a user
  async getByUserId(userId) {
    try {
      console.log('Getting lists for user ID:', userId);

      // Supabase API kullanarak kullanıcıya ait listeleri getir
      const { data, error } = await supabase
        .from('WordLists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw data from database:', data);

      // Format lists without word count
      const lists = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        context: item.context,
        createdAt: item.created_at,
        userId: item.user_id,
        wordCount: 0 // Kelime sayısını şimdilik 0 olarak ayarla
      }));

      console.log('Formatted lists:', lists);
      return lists;
    } catch (error) {
      console.error('Error getting lists by user ID:', error);
      throw error;
    }
  },

  // Get list by ID
  async getById(listId) {
    try {
      const { data, error } = await supabase
        .from('WordLists')
        .select('id, user_id, name, description, context, created_at')
        .eq('id', listId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Get word count using the PostgreSQL function
      const { data: countData, error: countError } = await supabase
        .rpc('get_word_count', { list_id: listId });

      if (countError) throw countError;

      // Format list
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        context: data.context,
        createdAt: data.created_at,
        wordCount: countData || 0
      };
    } catch (error) {
      console.error('Error getting list by ID:', error);
      throw error;
    }
  },

  // Create new list
  async create(listData) {
    try {
      const { userId, name, description, context } = listData;

      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!userData) {
        throw createError('NotFoundError', 'Kullanıcı bulunamadı');
      }

      // Create new list
      const { data, error } = await supabase
        .from('WordLists')
        .insert([
          {
            user_id: userId,
            name,
            description: description || null,
            context: context || null
          }
        ])
        .select('id, name, description, context, created_at')
        .single();

      if (error) throw error;

      // Format new list
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        context: data.context,
        createdAt: data.created_at,
        wordCount: 0 // New list has no words yet
      };
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  },

  // Update list
  async update(listId, listData) {
    try {
      const { name, description, context } = listData;

      // Update list
      const { data, error } = await supabase
        .from('WordLists')
        .update({
          name,
          description: description || null,
          context: context || null
        })
        .eq('id', listId)
        .select('id, name, description, context, created_at')
        .single();

      if (error) throw error;

      if (!data) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      // Get word count using the PostgreSQL function
      const { data: countData, error: countError } = await supabase
        .rpc('get_word_count', { list_id: listId });

      if (countError) throw countError;

      // Format updated list
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        context: data.context,
        createdAt: data.created_at,
        wordCount: countData || 0
      };
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  },

  // Delete list
  async delete(listId) {
    try {
      const { error } = await supabase
        .from('WordLists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }
};

module.exports = listModel;
