const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const wordRoutes = require('./routes/wordRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Tüm kaynaklara izin ver (geliştirme için)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lengo API',
      version: '1.0.0',
      description: 'Lengo API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Lists',
        description: 'Word lists endpoints',
      },
      {
        name: 'Words',
        description: 'Words endpoints',
      },
    ],
    paths: {
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Kullanıcı girişi',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Başarılı giriş',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                      },
                      token: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Geçersiz istek',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Yeni kullanıcı kaydı',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password', 'name'],
                  properties: {
                    username: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Kullanıcı başarıyla oluşturuldu',
            },
            '400': {
              description: 'Geçersiz istek',
            },
          },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Şifre sıfırlama',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Şifre sıfırlama başarılı',
            },
            '400': {
              description: 'Geçersiz istek',
            },
            '404': {
              description: 'Kullanıcı bulunamadı',
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Çıkış yapma',
          responses: {
            '200': {
              description: 'Çıkış başarılı',
            },
          },
        },
      },
      '/lists': {
        get: {
          tags: ['Lists'],
          summary: 'Kullanıcının kelime listelerini getir',
          parameters: [
            {
              in: 'query',
              name: 'userId',
              schema: {
                type: 'integer',
              },
              description: 'Kullanıcı ID',
            },
          ],
          responses: {
            '200': {
              description: 'Kelime listeleri başarıyla getirildi',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
        post: {
          tags: ['Lists'],
          summary: 'Yeni kelime listesi oluştur',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'name'],
                  properties: {
                    userId: {
                      type: 'integer',
                    },
                    name: {
                      type: 'string',
                    },
                    description: {
                      type: 'string',
                    },
                    context: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Liste başarıyla oluşturuldu',
            },
            '400': {
              description: 'Geçersiz istek',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
      },
      '/words/list/{listId}': {
        get: {
          tags: ['Words'],
          summary: 'Belirli bir listedeki kelimeleri getir',
          parameters: [
            {
              in: 'path',
              name: 'listId',
              required: true,
              schema: {
                type: 'integer',
              },
              description: 'Liste ID',
            },
          ],
          responses: {
            '200': {
              description: 'Kelimeler başarıyla getirildi',
            },
            '404': {
              description: 'Liste bulunamadı',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
      },
      '/words': {
        post: {
          tags: ['Words'],
          summary: 'Yeni kelime ekle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['listId', 'value', 'meaning'],
                  properties: {
                    listId: {
                      type: 'integer',
                    },
                    value: {
                      type: 'string',
                    },
                    meaning: {
                      type: 'string',
                    },
                    context: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Kelime başarıyla eklendi',
            },
            '400': {
              description: 'Geçersiz istek',
            },
            '404': {
              description: 'Liste bulunamadı',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
      },
      '/words/bulk': {
        post: {
          tags: ['Words'],
          summary: 'Toplu kelime ekle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['listId', 'words'],
                  properties: {
                    listId: {
                      type: 'integer',
                    },
                    words: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['value', 'meaning'],
                        properties: {
                          value: {
                            type: 'string',
                          },
                          meaning: {
                            type: 'string',
                          },
                          context: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Kelimeler başarıyla eklendi',
            },
            '400': {
              description: 'Geçersiz istek',
            },
            '404': {
              description: 'Liste bulunamadı',
            },
            '401': {
              description: 'Yetkilendirme hatası',
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/words', wordRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      message: 'API is running',
      dbStatus: 'Connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'Error', message: 'Health check failed' });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
