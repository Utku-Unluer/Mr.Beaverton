const express = require('express');
const wordController = require('../controllers/wordController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware
const auth = verifyToken;

/**
 * @swagger
 * /words/list/{listId}:
 *   get:
 *     summary: Belirli bir listedeki kelimeleri getir
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Liste ID
 *     responses:
 *       200:
 *         description: Kelimeler başarıyla getirildi
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/list/:listId', auth, wordController.getWordsByList);

/**
 * @swagger
 * /words/{wordId}:
 *   get:
 *     summary: Belirli bir kelimeyi getir
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kelime ID
 *     responses:
 *       200:
 *         description: Kelime başarıyla getirildi
 *       404:
 *         description: Kelime bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/:wordId', auth, wordController.getWordById);

/**
 * @swagger
 * /words:
 *   post:
 *     summary: Yeni kelime ekle
 *     tags: [Words]
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
 *               value:
 *                 type: string
 *               meaning:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kelime başarıyla eklendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', auth, wordController.createWord);

/**
 * @swagger
 * /words/bulk:
 *   post:
 *     summary: Toplu kelime ekle
 *     tags: [Words]
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
 *                     meaning:
 *                       type: string
 *                     context:
 *                       type: string
 *     responses:
 *       201:
 *         description: Kelimeler başarıyla eklendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/bulk', auth, wordController.createBulkWords);

/**
 * @swagger
 * /words/{wordId}:
 *   put:
 *     summary: Kelimeyi güncelle
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kelime ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - meaning
 *             properties:
 *               value:
 *                 type: string
 *               meaning:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kelime başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Kelime bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/:wordId', auth, wordController.updateWord);

/**
 * @swagger
 * /words/{wordId}:
 *   delete:
 *     summary: Kelimeyi sil
 *     tags: [Words]
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
 *       404:
 *         description: Kelime bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.delete('/:wordId', auth, wordController.deleteWord);

module.exports = router;
