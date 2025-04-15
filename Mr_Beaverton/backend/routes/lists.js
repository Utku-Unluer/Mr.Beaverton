const express = require('express');
const router = express.Router();
const { executeQuery, executeStoredProcedure } = require('../db/db');

/**
 * @route GET /api/lists
 * @desc Get all word lists for a user
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    // In a real app, get userId from JWT token
    // For demo, we'll use a query parameter
    const userId = req.query.userId || 1;

    // Get all lists for the user
    const lists = await executeQuery(`
      SELECT l.id, l.name, l.description, l.context, l.createdAt
      FROM WordLists l
      WHERE l.userId = @userId
      ORDER BY l.createdAt DESC
    `, { userId });

    // Get word count for each list
    for (const list of lists) {
      const wordCountResult = await executeStoredProcedure('GetWordCount', { listId: list.id });
      list.wordCount = wordCountResult[0].wordCount;
    }

    return res.status(200).json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route POST /api/lists
 * @desc Create a new word list
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    // In a real app, get userId from JWT token
    // For demo, we'll use a query parameter or body
    const userId = req.query.userId || req.body.userId || 1;
    const { name, description, context } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Liste adı gereklidir' });
    }

    // Create new list
    const result = await executeQuery(`
      INSERT INTO WordLists (userId, name, description, context)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.context, INSERTED.createdAt
      VALUES (@userId, @name, @description, @context)
    `, { userId, name, description: description || null, context: context || null });

    const newList = result[0];
    newList.wordCount = 0; // New list has no words yet

    return res.status(201).json(newList);
  } catch (error) {
    console.error('Create list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route GET /api/lists/:id
 * @desc Get a specific word list
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    // Get list details
    const lists = await executeQuery(`
      SELECT l.id, l.userId, l.name, l.description, l.context, l.createdAt
      FROM WordLists l
      WHERE l.id = @listId
    `, { listId });

    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    const list = lists[0];

    // Get word count
    const wordCountResult = await executeStoredProcedure('GetWordCount', { listId });
    list.wordCount = wordCountResult[0].wordCount;

    return res.status(200).json(list);
  } catch (error) {
    console.error('Get list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route PUT /api/lists/:id
 * @desc Update a word list
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const { name, description, context } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Liste adı gereklidir' });
    }

    // Check if list exists
    const lists = await executeQuery(`
      SELECT id FROM WordLists
      WHERE id = @listId
    `, { listId });

    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Update list
    await executeQuery(`
      UPDATE WordLists
      SET name = @name, description = @description, context = @context
      WHERE id = @listId
    `, { listId, name, description: description || null, context: context || null });

    // Get updated list
    const updatedLists = await executeQuery(`
      SELECT l.id, l.name, l.description, l.context, l.createdAt
      FROM WordLists l
      WHERE l.id = @listId
    `, { listId });

    const updatedList = updatedLists[0];

    // Get word count
    const wordCountResult = await executeStoredProcedure('GetWordCount', { listId });
    updatedList.wordCount = wordCountResult[0].wordCount;

    return res.status(200).json(updatedList);
  } catch (error) {
    console.error('Update list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route DELETE /api/lists/:id
 * @desc Delete a word list
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    // Check if list exists
    const lists = await executeQuery(`
      SELECT id FROM WordLists
      WHERE id = @listId
    `, { listId });

    if (lists.length === 0) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Delete list (cascade will delete words)
    await executeQuery(`
      DELETE FROM WordLists
      WHERE id = @listId
    `, { listId });

    return res.status(200).json({ message: 'Liste başarıyla silindi' });
  } catch (error) {
    console.error('Delete list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
