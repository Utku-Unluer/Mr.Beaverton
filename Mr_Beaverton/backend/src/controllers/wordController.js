const wordModel = require('../models/wordModel');
const { createError } = require('../utils/helpers');

// Word controller
const wordController = {
  // Get all words for a list
  async getWordsByList(req, res, next) {
    try {
      const listId = parseInt(req.params.listId);

      // Get words
      const words = await wordModel.getByListId(listId);

      res.status(200).json(words);
    } catch (error) {
      next(error);
    }
  },

  // Get word by ID
  async getWordById(req, res, next) {
    try {
      const wordId = parseInt(req.params.wordId);

      // Get word
      const word = await wordModel.getById(wordId);

      if (!word) {
        throw createError('NotFoundError', 'Kelime bulunamadı');
      }

      res.status(200).json(word);
    } catch (error) {
      next(error);
    }
  },

  // Create new word
  async createWord(req, res, next) {
    try {
      const { listId, value, meaning, context } = req.body;

      // Validate input
      if (!listId || !value || !meaning) {
        throw createError('ValidationError', 'Liste ID, kelime ve anlam gereklidir');
      }

      // Create word
      const newWord = await wordModel.create({ listId, value, meaning, context });

      res.status(201).json(newWord);
    } catch (error) {
      next(error);
    }
  },

  // Create multiple words
  async createBulkWords(req, res, next) {
    try {
      const { listId, words } = req.body;

      // Validate input
      if (!listId || !Array.isArray(words) || words.length === 0) {
        throw createError('ValidationError', 'Liste ID ve kelimeler dizisi gereklidir');
      }

      // Create words
      const addedWords = await wordModel.createBulk(listId, words);

      res.status(201).json(addedWords);
    } catch (error) {
      next(error);
    }
  },

  // Update word
  async updateWord(req, res, next) {
    try {
      const wordId = parseInt(req.params.wordId);
      const { value, meaning, context } = req.body;

      // Validate input
      if (!value || !meaning) {
        throw createError('ValidationError', 'Kelime ve anlam gereklidir');
      }

      // Update word
      const updatedWord = await wordModel.update(wordId, { value, meaning, context });

      res.status(200).json(updatedWord);
    } catch (error) {
      next(error);
    }
  },

  // Delete word
  async deleteWord(req, res, next) {
    try {
      const wordId = parseInt(req.params.wordId);

      // Delete word
      const success = await wordModel.delete(wordId);

      if (!success) {
        throw createError('NotFoundError', 'Kelime bulunamadı');
      }

      res.status(200).json({ message: 'Kelime başarıyla silindi' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = wordController;
