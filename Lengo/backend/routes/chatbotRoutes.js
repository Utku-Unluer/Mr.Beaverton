const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();
const { supabase } = require('../server');

// Bellek içi sohbet geçmişi saklama (oturum süresince)
const chatHistory = {}; // { userId: [{ role: 'user|assistant', content: 'message' }] }

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     tags: [Chatbot]
 *     summary: Chatbot'a mesaj gönder
 *     description: Kullanıcının mesajını chatbot API'sine gönderir ve yanıt alır
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Merhaba, nasıl kelime öğrenebilirim?
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Merhaba! Kelime öğrenmek için düzenli pratik yapmanızı öneririm.
 *       500:
 *         description: Sunucu hatası
 */
router.post('/message', async (req, res) => {
  try {
    const { message, userId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Mesaj gereklidir' });
    }

    // API key'i .env dosyasından al
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OpenAI API key bulunamadı. Yerel yanıt kullanılıyor.');
      // API key yoksa yerel yanıt oluştur
      const localResponse = generateLocalResponse(message);

      // Geçmişe ekle
      if (!chatHistory[userId]) {
        chatHistory[userId] = [];
      }
      chatHistory[userId].push({ role: 'user', content: message });
      chatHistory[userId].push({ role: 'assistant', content: localResponse });

      // Geçmişi 10 mesajla sınırla
      if (chatHistory[userId].length > 20) {
        chatHistory[userId] = chatHistory[userId].slice(-20);
      }

      // API anahtarı olmadığında da Supabase'e kaydet
      try {
        const { error: saveError } = await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: parseInt(userId),
            message: message,
            response: localResponse,
            context: JSON.stringify({
              timestamp: new Date().toISOString(),
              history_length: chatHistory[userId].length,
              no_api_key: true
            })
          });

        if (saveError) {
          console.error('API anahtarı olmadan chatbot yanıtı kaydedilirken hata:', saveError);
        }
      } catch (dbError) {
        console.error('Supabase hatası:', dbError);
        // Veritabanı hatası olsa bile yanıtı döndür
      }

      return res.status(200).json({
        message: localResponse
      });
    }

    try {
      // Sistem prompt'unu .env dosyasından al veya varsayılanı kullan
      const systemPrompt = process.env.CHATBOT_SYSTEM_PROMPT ||
        'Sen Lengo adlı bir dil öğrenme uygulamasının yardımcı chatbotusun. ' +
        'Kullanıcılara kelime öğrenme, test çözme ve liste oluşturma konularında yardımcı oluyorsun. ' +
        'Yanıtların kısa, net ve yardımcı olmalı. Türkçe yanıt ver.';

      // Kullanıcının geçmişini kontrol et veya oluştur
      if (!chatHistory[userId]) {
        chatHistory[userId] = [];
      }

      // Kullanıcı mesajını geçmişe ekle
      chatHistory[userId].push({ role: 'user', content: message });

      // Geçmişi 10 mesajla sınırla (sistem mesajı hariç)
      if (chatHistory[userId].length > 10) {
        chatHistory[userId] = chatHistory[userId].slice(-10);
      }

      // Mesajları hazırla
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory[userId]
      ];

      // OpenAI API'sine istek gönder
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo', // veya 'gpt-4' gibi daha gelişmiş bir model
        messages: messages,
        max_tokens: 300, // Yanıt uzunluğunu sınırla
        temperature: 0.7 // Yaratıcılık seviyesi (0-1 arası)
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // API yanıtını işle
      const chatResponse = response.data.choices[0].message.content.trim();

      // Yanıtı geçmişe ekle
      chatHistory[userId].push({ role: 'assistant', content: chatResponse });

      // Konuşmayı Supabase'e kaydet
      try {
        const { error: saveError } = await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: parseInt(userId),
            message: message,
            response: chatResponse,
            context: JSON.stringify({
              timestamp: new Date().toISOString(),
              history_length: chatHistory[userId].length
            })
          });

        if (saveError) {
          console.error('Chatbot konuşması kaydedilirken hata:', saveError);
        }
      } catch (dbError) {
        console.error('Supabase hatası:', dbError);
        // Veritabanı hatası olsa bile yanıtı döndür
      }

      return res.status(200).json({
        message: chatResponse
      });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError.response?.data || apiError.message);

      // API hatası durumunda yerel yanıt oluştur
      const fallbackResponse = generateLocalResponse(message);

      // Yanıtı geçmişe ekle
      chatHistory[userId].push({ role: 'assistant', content: fallbackResponse });

      // Yerel yanıtı da Supabase'e kaydet
      try {
        const { error: saveError } = await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: parseInt(userId),
            message: message,
            response: fallbackResponse,
            context: JSON.stringify({
              timestamp: new Date().toISOString(),
              history_length: chatHistory[userId].length,
              is_fallback: true
            })
          });

        if (saveError) {
          console.error('Yerel chatbot yanıtı kaydedilirken hata:', saveError);
        }
      } catch (dbError) {
        console.error('Supabase hatası:', dbError);
        // Veritabanı hatası olsa bile yanıtı döndür
      }

      return res.status(200).json({
        message: fallbackResponse
      });
    }
  } catch (error) {
    console.error('Chatbot message error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @swagger
 * /api/chatbot/clear-history:
 *   post:
 *     tags: [Chatbot]
 *     summary: Chatbot konuşma geçmişini temizle
 *     description: Kullanıcının chatbot konuşma geçmişini temizler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: default
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Konuşma geçmişi temizlendi
 *       500:
 *         description: Sunucu hatası
 */
router.post('/clear-history', async (req, res) => {
  try {
    const { userId = 'default' } = req.body;

    // Kullanıcının bellek içi geçmişini temizle
    if (chatHistory[userId]) {
      chatHistory[userId] = [];
    }

    // Supabase'e temizleme işlemini kaydet
    try {
      const { error: saveError } = await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: parseInt(userId),
          message: '[SYSTEM]',
          response: 'Konuşma geçmişi temizlendi',
          context: JSON.stringify({
            timestamp: new Date().toISOString(),
            action: 'clear_history'
          })
        });

      if (saveError) {
        console.error('Konuşma geçmişi temizleme kaydı oluşturulurken hata:', saveError);
      }
    } catch (dbError) {
      console.error('Supabase hatası:', dbError);
      // Veritabanı hatası olsa bile devam et
    }

    return res.status(200).json({ message: 'Konuşma geçmişi temizlendi' });
  } catch (error) {
    console.error('Clear history error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yerel yanıt oluşturma fonksiyonu
function generateLocalResponse(userInput) {
  const input = userInput.toLowerCase();

  if (input.includes('merhaba') || input.includes('selam')) {
    return 'Merhaba! Nasıl yardımcı olabilirim?';
  } else if (input.includes('nasıl') && input.includes('kelime')) {
    return 'Kelime öğrenmek için düzenli pratik yapmanızı öneririm. Her gün 5-10 yeni kelime öğrenmeyi hedefleyin ve öğrendiğiniz kelimeleri cümleler içinde kullanın.';
  } else if (input.includes('test') || input.includes('quiz')) {
    return 'Test özelliğimizi kullanarak kelime bilginizi ölçebilirsiniz. Ana menüden "Test Modu" seçeneğine tıklayarak başlayabilirsiniz.';
  } else if (input.includes('liste') && (input.includes('nasıl') || input.includes('oluştur'))) {
    return 'Yeni bir kelime listesi oluşturmak için ana menüden "Liste Oluştur" seçeneğine tıklayabilirsiniz. Liste adı ve açıklaması girerek kendi kelime listenizi oluşturabilirsiniz.';
  } else if (input.includes('teşekkür')) {
    return 'Rica ederim! Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım.';
  } else if (input.includes('temizle') || input.includes('sıfırla') || input.includes('yeni konuşma')) {
    return 'Konuşma geçmişiniz temizlendi. Yeni bir konuşmaya başlayabilirsiniz.';
  } else {
    return 'Bu konuda daha fazla bilgi verebilmem için biraz daha açıklayıcı olabilir misiniz?';
  }
}

module.exports = router;
