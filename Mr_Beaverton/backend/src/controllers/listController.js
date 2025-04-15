const listModel = require('../models/listModel');
const { createError } = require('../utils/helpers');

// List controller
const listController = {
  // Get all lists for a user
  async getLists(req, res, next) {
    try {
      // In a real app, get userId from JWT token
      // For demo, we'll use a query parameter or body
      let userId = parseInt(req.query.userId) || (req.body && req.body.userId);

      // Eğer req.user varsa, ondan al
      if (!userId && req.user) {
        userId = req.user.id;
      }

      console.log('Getting lists for userId:', userId);

      // Get lists
      let lists = [];

      try {
        // Veritabanından listeleri getir
        lists = await listModel.getByUserId(userId);
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Hata durumunda boş dizi döndür
        lists = [];
      }

      console.log('Found lists:', lists);

      res.status(200).json(lists);
    } catch (error) {
      console.error('Get lists error:', error);
      next(error);
    }
  },

  // Get list by ID
  async getListById(req, res, next) {
    try {
      const listId = parseInt(req.params.listId);

      // Get list
      const list = await listModel.getById(listId);

      if (!list) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  },

  // Create new list
  async createList(req, res, next) {
    try {
      console.log('Create list request:', req.body);

      const { name, description, context, userId } = req.body;

      // Kullanıcı ID'si gereklidir
      if (!userId) {
        return res.status(400).json({ message: 'Kullanıcı ID gereklidir' });
      }

      // Kullanıcı ID'sini integer'a çevir
      const userIdInt = parseInt(userId);
      console.log('Using userId:', userIdInt);

      // Validate input
      if (!name) {
        return res.status(400).json({ message: 'Liste adı gereklidir' });
      }

      // Create list
      try {
        const newList = await listModel.create({ userId: userIdInt, name, description, context });
        return res.status(201).json(newList);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ message: 'Veritabanı hatası', error: dbError.message });
      }
    } catch (error) {
      console.error('Create list error:', error);
      return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
  },

  // Update list
  async updateList(req, res, next) {
    try {
      const listId = parseInt(req.params.listId);
      const { name, description, context } = req.body;

      // Validate input
      if (!name) {
        throw createError('ValidationError', 'Liste adı gereklidir');
      }

      // Update list
      const updatedList = await listModel.update(listId, { name, description, context });

      res.status(200).json(updatedList);
    } catch (error) {
      next(error);
    }
  },

  // Delete list
  async deleteList(req, res, next) {
    try {
      const listId = parseInt(req.params.listId);

      // Delete list
      const success = await listModel.delete(listId);

      if (!success) {
        throw createError('NotFoundError', 'Liste bulunamadı');
      }

      res.status(200).json({ message: 'Liste başarıyla silindi' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = listController;
