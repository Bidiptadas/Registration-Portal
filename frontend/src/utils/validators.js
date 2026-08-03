/**
 * Form validation utility functions.
 */

export const validators = {
  email: (value) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(value) ? '' : 'Please enter a valid email address';
  },

  phone: (value) => {
    const pattern = /^(\+91)?[6-9]\d{9}$/;
    const cleaned = value.replace(/[\s-]/g, '');
    return pattern.test(cleaned) ? '' : 'Please enter a valid 10-digit phone number';
  },

  required: (value, fieldName = 'This field') => {
    return value && value.toString().trim() ? '' : `${fieldName} is required`;
  },

  minLength: (value, min, fieldName = 'This field') => {
    return value && value.length >= min ? '' : `${fieldName} must be at least ${min} characters`;
  },

  maxLength: (value, max, fieldName = 'This field') => {
    return value && value.length <= max ? '' : `${fieldName} must be at most ${max} characters`;
  },

  password: (value) => {
    if (!value || value.length < 6) return 'Password must be at least 6 characters';
    return '';
  },

  confirmPassword: (password, confirmPassword) => {
    return password === confirmPassword ? '' : 'Passwords do not match';
  },

  year: (value) => {
    const num = parseInt(value);
    return num >= 1 && num <= 4 ? '' : 'Year must be between 1 and 4';
  },
};

/**
 * Validate an entire form object.
 * @param {object} formData - Form field values
 * @param {object} rules - Validation rules per field
 * @returns {object} - Errors object (empty = valid)
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  for (const [field, validatorFn] of Object.entries(rules)) {
    const error = validatorFn(formData[field]);
    if (error) errors[field] = error;
  }
  return errors;
};

export default validators;
