const app = require('./app');
const { connectToDatabase } = require('./config/db');
require('dotenv').config();

// Set port
const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  console.log('Starting server...');

  // Connect to Supabase
  try {
    console.log('Attempting to connect to Supabase...');
    const connected = await connectToDatabase();
    if (!connected) {
      console.error('Failed to connect to Supabase.');
      console.error('Please check your Supabase configuration in .env file.');
      console.error('Press Ctrl+C to exit.');
      // Keep the process running to see the error
      while (true) { await new Promise(resolve => setTimeout(resolve, 1000)); }
    }
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Supabase connection error:', error);
    console.error('Stack trace:', error.stack);
    console.error('Please check your Supabase configuration in .env file.');
    console.error('Press Ctrl+C to exit.');
    // Keep the process running to see the error
    while (true) { await new Promise(resolve => setTimeout(resolve, 1000)); }
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
startServer();
