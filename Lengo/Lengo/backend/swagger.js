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
    },
  },
  // API rotalarını içeren dosyaların yolları
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
