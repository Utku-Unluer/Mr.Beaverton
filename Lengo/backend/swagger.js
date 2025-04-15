const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger tanımlaması
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lengo API',
      version: '1.0.0',
      description: 'Lengo dil öğrenme uygulaması için API dokümantasyonu',
      contact: {
        name: 'Lengo Team',
        url: 'https://github.com/yourusername/lengo',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Kullanıcı ID',
              example: 1
            },
            username: {
              type: 'string',
              description: 'Kullanıcı adı',
              example: 'testuser'
            },
            email: {
              type: 'string',
              description: 'E-posta adresi',
              example: 'test@example.com'
            },
            name: {
              type: 'string',
              description: 'Tam ad',
              example: 'Test User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
              example: '2023-01-01T00:00:00.000Z'
            },
            streak: {
              type: 'integer',
              description: 'Çalışma serisi',
              example: 5
            },
            lastActive: {
              type: 'string',
              format: 'date-time',
              description: 'Son aktif olma tarihi',
              example: '2023-01-10T00:00:00.000Z'
            }
          }
        },
        WordList: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Liste ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Liste adı',
              example: 'Temel İngilizce'
            },
            description: {
              type: 'string',
              description: 'Liste açıklaması',
              example: 'Günlük hayatta kullanılan temel İngilizce kelimeler'
            },
            context: {
              type: 'string',
              description: 'Liste bağlamı',
              example: 'Seyahat'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
              example: '2023-01-01T00:00:00.000Z'
            },
            wordCount: {
              type: 'integer',
              description: 'Kelime sayısı',
              example: 50
            }
          }
        },
        Word: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Kelime ID',
              example: 1
            },
            listId: {
              type: 'integer',
              description: 'Liste ID',
              example: 1
            },
            value: {
              type: 'string',
              description: 'Kelime',
              example: 'apple'
            },
            meaning: {
              type: 'string',
              description: 'Anlam',
              example: 'elma'
            },
            context: {
              type: 'string',
              description: 'Bağlam',
              example: 'I eat an apple every day.'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Kimlik doğrulama işlemleri'
      },
      {
        name: 'Lists',
        description: 'Kelime listeleri işlemleri'
      },
      {
        name: 'Words',
        description: 'Kelime işlemleri'
      }
    ]
  },
  // API rotalarını içeren dosyaların yolları
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
