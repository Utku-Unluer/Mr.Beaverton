const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to false for production
  }
};

// Create a connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Handle connection errors
pool.on('error', err => {
  console.error('SQL error', err);
});

/**
 * Execute a SQL query
 * @param {string} query - SQL query string
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - Query result
 */
async function executeQuery(query, params = {}) {
  try {
    await poolConnect; // Ensure pool is connected
    const request = pool.request();
    
    // Add parameters to request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

/**
 * Execute a stored procedure
 * @param {string} procedureName - Stored procedure name
 * @param {Object} params - Procedure parameters
 * @returns {Promise<any>} - Procedure result
 */
async function executeStoredProcedure(procedureName, params = {}) {
  try {
    await poolConnect; // Ensure pool is connected
    const request = pool.request();
    
    // Add parameters to request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute(procedureName);
    return result.recordset;
  } catch (err) {
    console.error('Stored procedure error:', err);
    throw err;
  }
}

module.exports = {
  executeQuery,
  executeStoredProcedure,
  sql
};
