const express = require('express');
const listController = require('../controllers/listController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware
const auth = verifyToken;

/**
 * @swagger
 * /lists:
 *   get:
 *     summary: Kullanıcının kelime listelerini getir
 *     tags: [Lists]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kelime listeleri başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', auth, listController.getLists);

/**
 * @swagger
 * /lists/{listId}:
 *   get:
 *     summary: Belirli bir kelime listesini getir
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Liste ID
 *     responses:
 *       200:
 *         description: Liste başarıyla getirildi
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/:listId', auth, listController.getListById);

/**
 * @swagger
 * /lists:
 *   post:
 *     summary: Yeni kelime listesi oluştur
 *     tags: [Lists]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       201:
 *         description: Liste başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', listController.createList);

/**
 * @swagger
 * /lists/{listId}:
 *   put:
 *     summary: Kelime listesini güncelle
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Liste ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       200:
 *         description: Liste başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/:listId', auth, listController.updateList);

/**
 * @swagger
 * /lists/{listId}:
 *   delete:
 *     summary: Kelime listesini sil
 *     tags: [Lists]
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
 *       404:
 *         description: Liste bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.delete('/:listId', auth, listController.deleteList);

module.exports = router;
