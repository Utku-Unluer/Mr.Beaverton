const { supabase } = require('../config/db');
const { createError } = require('../utils/helpers');

// Word model
const wordModel = {
  // Get all words for a list
  async getByListId(listId) {
    try {
      // Check if list exists
      const { data: listData, error: listError } = await supabase
        .from('WordLists')
        .select('id')
        .eq('id', listId)
        .single();

      if (listError && listError.code !== 'PGRST116') throw listError;

      if (!listData) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      // Get all words for the list
      const { data, error } = await supabase
        .from('Words')
        .select('id, list_id, value, meaning, context, created_at')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format words
      return data.map(word => ({
        id: word.id,
        listId: word.list_id,
        value: word.value,
        meaning: word.meaning,
        context: word.context,
        createdAt: word.created_at
      }));
    } catch (error) {
      console.error('Error getting words by list ID:', error);
      throw error;
    }
  },

  // Get word by ID
  async getById(wordId) {
    try {
      const { data, error } = await supabase
        .from('Words')
        .select('id, list_id, value, meaning, context, created_at')
        .eq('id', wordId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      // Format word
      return {
        id: data.id,
        listId: data.list_id,
        value: data.value,
        meaning: data.meaning,
        context: data.context,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error getting word by ID:', error);
      throw error;
    }
  },

  // Create new word
  async create(wordData) {
    try {
      const { listId, value, meaning, context } = wordData;

      // Check if list exists
      const { data: listData, error: listError } = await supabase
        .from('WordLists')
        .select('id')
        .eq('id', listId)
        .single();

      if (listError && listError.code !== 'PGRST116') throw listError;

      if (!listData) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      // Add new word
      const { data, error } = await supabase
        .from('Words')
        .insert([
          {
            list_id: listId,
            value,
            meaning,
            context: context || null
          }
        ])
        .select('id, list_id, value, meaning, context, created_at')
        .single();

      if (error) throw error;

      // Format word
      return {
        id: data.id,
        listId: data.list_id,
        value: data.value,
        meaning: data.meaning,
        context: data.context,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating word:', error);
      throw error;
    }
  },

  // Create multiple words
  async createBulk(listId, words) {
    try {
      // Check if list exists
      const { data: listData, error: listError } = await supabase
        .from('WordLists')
        .select('id')
        .eq('id', listId)
        .single();

      if (listError && listError.code !== 'PGRST116') throw listError;

      if (!listData) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      // Filter out invalid words
      const validWords = words.filter(word => word.value && word.meaning);

      if (validWords.length === 0) {
        return [];
      }

      // Format words for insertion
      const wordsToInsert = validWords.map(word => ({
        list_id: listId,
        value: word.value,
        meaning: word.meaning,
        context: word.context || null
      }));

      // Add words
      const { data, error } = await supabase
        .from('Words')
        .insert(wordsToInsert)
        .select('id, list_id, value, meaning, context, created_at');

      if (error) throw error;

      // Format words
      return data.map(word => ({
        id: word.id,
        listId: word.list_id,
        value: word.value,
        meaning: word.meaning,
        context: word.context,
        createdAt: word.created_at
      }));
    } catch (error) {
      console.error('Error creating bulk words:', error);
      throw error;
    }
  },

  // Update word
  async update(wordId, wordData) {
    try {
      const { value, meaning, context } = wordData;

      // Update word
      const { data, error } = await supabase
        .from('Words')
        .update({
          value,
          meaning,
          context: context || null
        })
        .eq('id', wordId)
        .select('id, list_id, value, meaning, context, created_at')
        .single();

      if (error) throw error;

      if (!data) {
        throw createError('NotFoundError', 'Kelime bulunamadı');
      }

      // Format word
      return {
        id: data.id,
        listId: data.list_id,
        value: data.value,
        meaning: data.meaning,
        context: data.context,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  },

  // Delete word
  async delete(wordId) {
    try {
      const { error } = await supabase
        .from('Words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  }
};

module.exports = wordModel;
