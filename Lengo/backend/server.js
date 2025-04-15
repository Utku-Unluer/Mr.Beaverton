require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const { specs, swaggerUi } = require('./swagger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    fetch: fetch
  }
});

// Import routes
const authRoutes = express.Router();
const listsRoutes = express.Router();
const wordsRoutes = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Kullanıcı girişi
 *     description: E-posta ve şifre ile kullanıcı girişi yapar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test123
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: mock-token-123
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }

    // Check user in Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, password, created_at, streak, last_active')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!users) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Simple password check (in a real app, you'd use bcrypt)
    if (users.password !== password) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Format user data
    const user = {
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.created_at,
      streak: users.streak || 0,
      lastActive: users.last_active || new Date().toISOString()
    };

    // Update last active time
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    // Base64 encode a JSON object with user ID
    const tokenPayload = { id: user.id };
    const tokenBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenBase64}.signature`;

    return res.status(200).json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Yeni kullanıcı kaydı
 *     description: Yeni bir kullanıcı hesabı oluşturur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser
 *               email:
 *                 type: string
 *                 format: email
 *                 example: new@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: New User
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: mock-token-456
 *       400:
 *         description: Geçersiz istek veya kullanıcı zaten mevcut
 */
authRoutes.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Supabase check error:', checkError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password, // In a real app, you'd hash this password
          name,
          streak: 0,
          last_active: new Date().toISOString()
        }
      ])
      .select('id, email, name, created_at, streak, last_active')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ message: 'Kullanıcı oluşturulurken hata oluştu' });
    }

    // Format user data
    const user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.created_at,
      streak: newUser.streak || 0,
      lastActive: newUser.last_active || new Date().toISOString()
    };

    // Generate JWT token
    // Base64 encode a JSON object with user ID
    const tokenPayload = { id: user.id };
    const tokenBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenBase64}.signature`;

    // Return new user data
    return res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Şifre sıfırlama
 *     description: Kullanıcının şifresini sıfırlar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Şifre sıfırlama başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       404:
 *         description: Kullanıcı bulunamadı
 */
authRoutes.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'E-posta gereklidir' });
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('User check error:', error);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' });
    }

    // In a real app, you would generate a reset token and send an email
    // For now, we'll just return a success message
    return res.status(200).json({ message: 'Şifre sıfırlama başarılı' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/lists:
 *   get:
 *     tags: [Lists]
 *     summary: Tüm listeleri getir
 *     description: Kullanıcının tüm kelime listelerini getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID (opsiyonel)
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WordList'
 *       401:
 *         description: Yetkilendirme hatası
 */
listsRoutes.get('/', async (req, res) => {
  try {
    // In a real app, get userId from JWT token
    // For demo, we'll use a query parameter
    const userId = req.query.userId || 1;

    // Get lists from Supabase
    const { data: lists, error } = await supabase
      .from('wordlists')
      .select('id, user_id, name, description, context, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    // Format lists and get word count
    const formattedLists = [];

    for (const list of lists) {
      // Get word count
      const { count, error: countError } = await supabase
        .from('words')
        .select('id', { count: 'exact' })
        .eq('list_id', list.id);

      if (countError) {
        console.error('Word count error:', countError);
      }

      formattedLists.push({
        id: list.id,
        userId: list.user_id,
        name: list.name,
        description: list.description || '',
        context: list.context,
        createdAt: list.created_at,
        wordCount: count || 0
      });
    }

    return res.status(200).json(formattedLists);
  } catch (error) {
    console.error('Get lists error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/lists:
 *   post:
 *     tags: [Lists]
 *     summary: Yeni liste oluştur
 *     description: Yeni bir kelime listesi oluşturur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Seyahat Terimleri
 *               description:
 *                 type: string
 *                 example: Seyahat ederken kullanılacak terimler
 *               context:
 *                 type: string
 *                 example: Tatil
 *     responses:
 *       201:
 *         description: Liste başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WordList'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
listsRoutes.post('/', async (req, res) => {
  try {
    const { userId, name, description, context } = req.body;

    // Validate input
    if (!userId || !name) {
      return res.status(400).json({ message: 'Kullanıcı ID ve liste adı gereklidir' });
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('User check error:', userError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!userData) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Create new list in Supabase
    const { data: newList, error: insertError } = await supabase
      .from('wordlists')
      .insert([
        {
          user_id: userId,
          name,
          description: description || null,
          context: context || null
        }
      ])
      .select('id, user_id, name, description, context, created_at')
      .single();

    if (insertError) {
      console.error('List creation error:', insertError);
      return res.status(500).json({ message: 'Liste oluşturulurken hata oluştu' });
    }

    // Format list data
    const formattedList = {
      id: newList.id,
      userId: newList.user_id,
      name: newList.name,
      description: newList.description || '',
      context: newList.context,
      createdAt: newList.created_at,
      wordCount: 0 // New list has no words
    };

    return res.status(201).json(formattedList);
  } catch (error) {
    console.error('Create list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/lists/{listId}:
 *   delete:
 *     tags: [Lists]
 *     summary: Liste sil
 *     description: Belirli bir listeyi siler
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Liste ID
 *     responses:
 *       200:
 *         description: Liste başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Liste başarıyla silindi
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
listsRoutes.delete('/:listId', async (req, res) => {
  try {
    const listId = parseInt(req.params.listId);

    // Check if list exists
    const { data: listData, error: listError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError && listError.code !== 'PGRST116') {
      console.error('List check error:', listError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!listData) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // First delete all words in the list
    const { error: deleteWordsError } = await supabase
      .from('words')
      .delete()
      .eq('list_id', listId);

    if (deleteWordsError) {
      console.error('Words deletion error:', deleteWordsError);
      return res.status(500).json({ message: 'Listedeki kelimeler silinirken hata oluştu' });
    }

    // Then delete the list
    const { error: deleteListError } = await supabase
      .from('wordlists')
      .delete()
      .eq('id', listId);

    if (deleteListError) {
      console.error('List deletion error:', deleteListError);
      return res.status(500).json({ message: 'Liste silinirken hata oluştu' });
    }

    return res.status(200).json({ message: 'Liste başarıyla silindi' });
  } catch (error) {
    console.error('Delete list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/words/list/{listId}:
 *   get:
 *     tags: [Words]
 *     summary: Listedeki kelimeleri getir
 *     description: Belirli bir listedeki tüm kelimeleri getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Liste ID
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
wordsRoutes.get('/list/:listId', async (req, res) => {
  try {
    const listId = parseInt(req.params.listId);

    // Check if list exists
    const { data: listData, error: listError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError && listError.code !== 'PGRST116') {
      console.error('List check error:', listError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!listData) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Get words from Supabase
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, list_id, value, meaning, context, created_at')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });

    if (wordsError) {
      console.error('Words fetch error:', wordsError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    // Format words
    const formattedWords = words.map(word => ({
      id: word.id,
      listId: word.list_id,
      value: word.value,
      meaning: word.meaning,
      context: word.context,
      createdAt: word.created_at
    }));

    return res.status(200).json(formattedWords);
  } catch (error) {
    console.error('Get words error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/words:
 *   post:
 *     tags: [Words]
 *     summary: Yeni kelime ekle
 *     description: Bir listeye yeni kelime ekler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - value
 *               - meaning
 *             properties:
 *               listId:
 *                 type: integer
 *                 example: 1
 *               value:
 *                 type: string
 *                 example: table
 *               meaning:
 *                 type: string
 *                 example: masa
 *               context:
 *                 type: string
 *                 example: The book is on the table.
 *     responses:
 *       201:
 *         description: Kelime başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Word'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
wordsRoutes.post('/', async (req, res) => {
  try {
    const { listId, value, meaning, context } = req.body;

    // Validate input
    if (!listId || !value || !meaning) {
      return res.status(400).json({ message: 'Liste ID, kelime ve anlam gereklidir' });
    }

    // Check if list exists
    const { data: listData, error: listError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError && listError.code !== 'PGRST116') {
      console.error('List check error:', listError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!listData) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Add word to Supabase
    const { data: newWord, error: insertError } = await supabase
      .from('words')
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

    if (insertError) {
      console.error('Word creation error:', insertError);
      return res.status(500).json({ message: 'Kelime eklenirken hata oluştu' });
    }

    // Format word
    const formattedWord = {
      id: newWord.id,
      listId: newWord.list_id,
      value: newWord.value,
      meaning: newWord.meaning,
      context: newWord.context,
      createdAt: newWord.created_at
    };

    return res.status(201).json(formattedWord);
  } catch (error) {
    console.error('Add word error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/words/bulk:
 *   post:
 *     tags: [Words]
 *     summary: Toplu kelime ekle
 *     description: Bir listeye toplu olarak kelime ekler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - words
 *             properties:
 *               listId:
 *                 type: integer
 *                 example: 1
 *               words:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - value
 *                     - meaning
 *                   properties:
 *                     value:
 *                       type: string
 *                       example: table
 *                     meaning:
 *                       type: string
 *                       example: masa
 *                     context:
 *                       type: string
 *                       example: The book is on the table.
 *     responses:
 *       201:
 *         description: Kelimeler başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
wordsRoutes.post('/bulk', async (req, res) => {
  try {
    const { listId, words } = req.body;

    // Validate input
    if (!listId || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: 'Liste ID ve kelimeler dizisi gereklidir' });
    }

    // Check if list exists
    const { data: listData, error: listError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError && listError.code !== 'PGRST116') {
      console.error('List check error:', listError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!listData) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Filter out invalid words
    const validWords = words.filter(word => word.value && word.meaning);

    if (validWords.length === 0) {
      return res.status(400).json({ message: 'En az bir geçerli kelime gereklidir' });
    }

    // Format words for insertion
    const wordsToInsert = validWords.map(word => ({
      list_id: listId,
      value: word.value,
      meaning: word.meaning,
      context: word.context || null
    }));

    // Add words to Supabase
    const { data: addedWords, error: insertError } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select('id, list_id, value, meaning, context, created_at');

    if (insertError) {
      console.error('Bulk word creation error:', insertError);
      return res.status(500).json({ message: 'Kelimeler eklenirken hata oluştu' });
    }

    // Format words
    const formattedWords = addedWords.map(word => ({
      id: word.id,
      listId: word.list_id,
      value: word.value,
      meaning: word.meaning,
      context: word.context,
      createdAt: word.created_at
    }));

    return res.status(201).json(formattedWords);
  } catch (error) {
    console.error('Bulk add words error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/words/{wordId}:
 *   delete:
 *     tags: [Words]
 *     summary: Kelime sil
 *     description: Belirli bir kelimeyi siler
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kelime ID
 *     responses:
 *       200:
 *         description: Kelime başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kelime başarıyla silindi
 *       404:
 *         description: Kelime bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
wordsRoutes.delete('/:wordId', async (req, res) => {
  try {
    const wordId = parseInt(req.params.wordId);

    // Check if word exists
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('id')
      .eq('id', wordId)
      .single();

    if (wordError && wordError.code !== 'PGRST116') {
      console.error('Word check error:', wordError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!wordData) {
      return res.status(404).json({ message: 'Kelime bulunamadı' });
    }

    // Delete word from Supabase
    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (deleteError) {
      console.error('Word deletion error:', deleteError);
      return res.status(500).json({ message: 'Kelime silinirken hata oluştu' });
    }

    return res.status(200).json({ message: 'Kelime başarıyla silindi' });
  } catch (error) {
    console.error('Delete word error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/words/bulk-delete:
 *   post:
 *     tags: [Words]
 *     summary: Toplu kelime sil
 *     description: Birden fazla kelimeyi toplu olarak siler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wordIds
 *             properties:
 *               wordIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Kelimeler başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kelimeler başarıyla silindi
 *                 deletedCount:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
wordsRoutes.post('/bulk-delete', async (req, res) => {
  try {
    const { wordIds } = req.body;
    console.log('Received wordIds:', wordIds);

    // Validate input
    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      return res.status(400).json({ message: 'Silinecek kelime ID\'leri gereklidir' });
    }

    // Ensure all IDs are integers
    const validWordIds = wordIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    console.log('Valid wordIds:', validWordIds);

    if (validWordIds.length === 0) {
      return res.status(400).json({ message: 'Geçerli kelime ID\'leri gereklidir' });
    }

    // Delete words one by one to avoid potential issues with the 'in' operator
    let deletedCount = 0;
    let errors = [];

    for (const wordId of validWordIds) {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId);

      if (error) {
        console.error(`Error deleting word ${wordId}:`, error);
        errors.push({ wordId, error: error.message });
      } else {
        deletedCount++;
      }
    }

    if (errors.length > 0) {
      console.error('Some words could not be deleted:', errors);
      if (deletedCount === 0) {
        return res.status(500).json({
          message: 'Kelimeler silinirken hata oluştu',
          errors
        });
      }
    }

    return res.status(200).json({
      message: deletedCount > 0
        ? `${deletedCount} kelime başarıyla silindi`
        : 'Hiçbir kelime silinemedi',
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk delete words error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Database configuration is handled by Supabase client

// Initialize app
const app = express();

// Middleware
// CORS ayarları - tüm kaynaklardan gelen isteklere izin ver
app.use(cors({
  origin: '*', // Tüm kaynaklara izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// UTF-8 karakter kodlaması için
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Swagger dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Connect to database
async function connectToDatabase() {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // Chatbot tablosunu oluştur (eğer yoksa)
    const createChatbotTableQuery = `
      -- Chatbot konuşmalarını saklamak için tablo oluştur
      CREATE TABLE IF NOT EXISTS chatbot_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        context JSONB
      );

      -- İndeksler ekle
      CREATE INDEX IF NOT EXISTS chatbot_conversations_user_id_idx ON chatbot_conversations(user_id);
      CREATE INDEX IF NOT EXISTS chatbot_conversations_created_at_idx ON chatbot_conversations(created_at);
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { query: createChatbotTableQuery });

    if (tableError) {
      console.warn('Chatbot tablosu oluşturulurken hata:', tableError);
      // Hata olsa bile devam et, tablo zaten var olabilir
    } else {
      console.log('Chatbot tablosu başarıyla oluşturuldu veya zaten vardı');
    }

    console.log('Connected to Supabase successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

// Test routes
const testRoutes = express.Router();

/**
 * @swagger
 * /api/tests/generate:
 *   post:
 *     tags: [Tests]
 *     summary: Test oluştur
 *     description: Belirli bir liste için test oluşturur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *             properties:
 *               listId:
 *                 type: integer
 *                 example: 1
 *               questionCount:
 *                 type: integer
 *                 example: 5
 *                 description: "Oluşturulacak soru sayısı (varsayılan: 5)"
 *     responses:
 *       200:
 *         description: Test başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       question:
 *                         type: string
 *                         example: "Hello kelimesinin anlamı aşağıdakilerden hangisidir?"
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "a"
 *                             text:
 *                               type: string
 *                               example: "merhaba"
 *                       correctAnswer:
 *                         type: string
 *                         example: "a"
 *                       wordId:
 *                         type: integer
 *                         example: 1
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Liste bulunamadı veya yeterli kelime yok
 *       401:
 *         description: Yetkilendirme hatası
 */
testRoutes.post('/generate', async (req, res) => {
  try {
    const { listId, questionCount = 5 } = req.body;

    // Validate input
    if (!listId) {
      return res.status(400).json({ message: 'Liste ID gereklidir' });
    }

    // Check if list exists
    const { data: listData, error: listError } = await supabase
      .from('wordlists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError && listError.code !== 'PGRST116') {
      console.error('List check error:', listError);
      return res.status(500).json({ message: 'Veritabanı hatası' });
    }

    if (!listData) {
      return res.status(404).json({ message: 'Liste bulunamadı' });
    }

    // Get all words from the list
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, value, meaning, context')
      .eq('list_id', listId);

    if (wordsError) {
      console.error('Get words error:', wordsError);
      return res.status(500).json({ message: 'Kelimeler alınırken hata oluştu' });
    }

    if (!words || words.length < 3) {
      return res.status(404).json({ message: 'Test oluşturmak için listede en az 3 kelime olmalıdır' });
    }

    // Limit question count to available words
    const actualQuestionCount = Math.min(questionCount, words.length);

    // Shuffle words to get random questions
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, actualQuestionCount);

    // Generate questions
    const questions = selectedWords.map((word, index) => {
      // Get 2 random wrong options from other words
      const otherWords = words.filter(w => w.id !== word.id);
      const shuffledOtherWords = [...otherWords].sort(() => 0.5 - Math.random());
      const wrongOptions = shuffledOtherWords.slice(0, 2).map(w => w.meaning);

      // Create options array with correct answer and wrong options
      const options = [word.meaning, ...wrongOptions];

      // Shuffle options
      const shuffledOptions = [...options].sort(() => 0.5 - Math.random());

      // Find index of correct answer
      const correctAnswerIndex = shuffledOptions.findIndex(option => option === word.meaning);

      // Map index to letter (0 -> 'a', 1 -> 'b', 2 -> 'c')
      const correctAnswer = String.fromCharCode(97 + correctAnswerIndex);

      // Format options as objects with id (a, b, c) and text
      const formattedOptions = shuffledOptions.map((option, i) => ({
        id: String.fromCharCode(97 + i), // a, b, c
        text: option
      }));

      return {
        id: index + 1,
        question: `"${word.value}" kelimesinin anlamı aşağıdakilerden hangisidir?`,
        options: formattedOptions,
        correctAnswer,
        wordId: word.id
      };
    });

    return res.status(200).json({ questions });
  } catch (error) {
    console.error('Generate test error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running', dbStatus: 'Connected to database' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    dbStatus: 'Connected to database',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/tests', testRoutes);

// Export supabase for use in other files
module.exports = { supabase };

// Import chatbot routes after exporting supabase to avoid circular dependency
const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API durumunu kontrol et
 *     description: API'nin çalışıp çalışmadığını kontrol etmek için kullanılır
 *     responses:
 *       200:
 *         description: API çalışıyor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 dbStatus:
 *                   type: string
 *                   example: Connected
 */
app.get('/api/health', async (_req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      message: 'API is running',
      dbStatus: 'Connected to database'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'Error', message: 'Health check failed' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server running on port ${PORT}`);

  // Swagger arayüzünü otomatik olarak aç
  const { exec } = require('child_process');
  const url = `http://localhost:${PORT}/api-docs`;
  console.log(`Opening Swagger UI at ${url}`);

  // İşletim sistemine göre tarayıcıyı aç
  const platform = process.platform;
  if (platform === 'win32') {
    exec(`start ${url}`);
  } else if (platform === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});

