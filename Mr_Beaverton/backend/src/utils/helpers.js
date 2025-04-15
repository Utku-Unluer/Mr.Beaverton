// Helper functions

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isStrongPassword(password) {
  // At least 6 characters
  return password && password.length >= 6;
}

// Create custom error
function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

// Sanitize user object (remove sensitive data)
function sanitizeUser(user) {
  if (!user) return null;
  
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

module.exports = {
  isValidEmail,
  isStrongPassword,
  createError,
  sanitizeUser
};
