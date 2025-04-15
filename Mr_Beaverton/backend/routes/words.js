const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/db');

/**
 * @route GET /api/words/list/:listId
 * @desc Get all words for a specific list
 * @access Private
 */
router.get('/list/:listId', async (req, res) => {
  try {
    const listId = req.params.listId;
    
    // Check if list exists
    const lists = await executeQuery(`
      SELECT id FROM WordLists
      WHERE id = @listId
    `, { listId });
    
    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }
    
    // Get all words for the list
    const words = await executeQuery(`
      SELECT id, listId, value, meaning, context, createdAt
      FROM Words
      WHERE listId = @listId
      ORDER BY createdAt DESC
    `, { listId });
    
    return res.status(200).json(words);
  } catch (error) {
    console.error('Get words error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route POST /api/words
 * @desc Add a new word to a list
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { listId, value, meaning, context } = req.body;
    
    // Validate input
    if (!listId || !value || !meaning) {
      return res.status(400).json({ message: 'Liste ID, kelime ve anlam gereklidir' });
    }
    
    // Check if list exists
    const lists = await executeQuery(`
      SELECT id FROM WordLists
      WHERE id = @listId
    `, { listId });
    
    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }
    
    // Add new word
    const result = await executeQuery(`
      INSERT INTO Words (listId, value, meaning, context)
      OUTPUT INSERTED.id, INSERTED.listId, INSERTED.value, INSERTED.meaning, INSERTED.context, INSERTED.createdAt
      VALUES (@listId, @value, @meaning, @context)
    `, { listId, value, meaning, context: context || null });
    
    const newWord = result[0];
    
    return res.status(201).json(newWord);
  } catch (error) {
    console.error('Add word error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route PUT /api/words/:id
 * @desc Update a word
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const wordId = req.params.id;
    const { value, meaning, context } = req.body;
    
    // Validate input
    if (!value || !meaning) {
      return res.status(400).json({ message: 'Kelime ve anlam gereklidir' });
    }
    
    // Check if word exists
    const words = await executeQuery(`
      SELECT id FROM Words
      WHERE id = @wordId
    `, { wordId });
    
    if (words.length === 0) {
      return res.status(404).json({ message: 'Kelime bulunamadı' });
    }
    
    // Update word
    await executeQuery(`
      UPDATE Words
      SET value = @value, meaning = @meaning, context = @context
      WHERE id = @wordId
    `, { wordId, value, meaning, context: context || null });
    
    // Get updated word
    const updatedWords = await executeQuery(`
      SELECT id, listId, value, meaning, context, createdAt
      FROM Words
      WHERE id = @wordId
    `, { wordId });
    
    return res.status(200).json(updatedWords[0]);
  } catch (error) {
    console.error('Update word error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route DELETE /api/words/:id
 * @desc Delete a word
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const wordId = req.params.id;
    
    // Check if word exists
    const words = await executeQuery(`
      SELECT id FROM Words
      WHERE id = @wordId
    `, { wordId });
    
    if (words.length === 0) {
      return res.status(404).json({ message: 'Kelime bulunamadı' });
    }
    
    // Delete word
    await executeQuery(`
      DELETE FROM Words
      WHERE id = @wordId
    `, { wordId });
    
    return res.status(200).json({ message: 'Kelime başarıyla silindi' });
  } catch (error) {
    console.error('Delete word error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route POST /api/words/bulk
 * @desc Add multiple words to a list
 * @access Private
 */
router.post('/bulk', async (req, res) => {
  try {
    const { listId, words } = req.body;
    
    // Validate input
    if (!listId || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: 'Liste ID ve kelimeler dizisi gereklidir' });
    }
    
    // Check if list exists
    const lists = await executeQuery(`
      SELECT id FROM WordLists
      WHERE id = @listId
    `, { listId });
    
    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }
    
    // Add words
    const addedWords = [];
    
    for (const word of words) {
      if (!word.value || !word.meaning) {
        continue; // Skip invalid words
      }
      
      const result = await executeQuery(`
        INSERT INTO Words (listId, value, meaning, context)
        OUTPUT INSERTED.id, INSERTED.listId, INSERTED.value, INSERTED.meaning, INSERTED.context, INSERTED.createdAt
        VALUES (@listId, @value, @meaning, @context)
      `, { 
        listId, 
        value: word.value, 
        meaning: word.meaning, 
        context: word.context || null 
      });
      
      addedWords.push(result[0]);
    }
    
    return res.status(201).json(addedWords);
  } catch (error) {
    console.error('Bulk add words error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
