export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const normalizeEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    const error = new Error('Please enter a valid email address.');
    error.code = 'auth/invalid-email';
    throw error;
  }

  return normalizedEmail;
};

export const validatePassword = (password) => {
  if (!PASSWORD_PATTERN.test(password)) {
    const error = new Error(
      'Password must contain at least 8 characters, one uppercase letter, one number, and one special symbol.'
    );
    error.code = 'auth/weak-password';
    throw error;
  }

  return password;
};