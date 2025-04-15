const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection pool for direct SQL queries
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Connect to database
async function connectToDatabase() {
  try {
    console.log('Connecting to Supabase...');

    // Test connection by making a simple query
    const { error } = await supabase.from('Users').select('count', { count: 'exact', head: true });

    if (error) throw error;

    console.log('Connected to Supabase successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

// Execute SQL query
async function executeQuery(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (err) {
    console.error('Query execution error:', err);
    throw err;
  }
}

module.exports = {
  supabase,
  pool,
  connectToDatabase,
  executeQuery
};
