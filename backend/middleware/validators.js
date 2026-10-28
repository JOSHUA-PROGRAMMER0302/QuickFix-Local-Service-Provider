const { body, validationResult } = require('express-validator');

/**
 * Extracts validation errors and sends a structured JSON response.
 * Used as middleware after validator chains.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed. Please check your input.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Password strength rules:
 * - min 8 characters
 * - at least 1 uppercase letter
 * - at least 1 lowercase letter
 * - at least 1 number
 * - at least 1 special character
 */
const passwordStrengthRules = (field = 'password') =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.');

/**
 * Email validation rule
 */
const emailRule = (field = 'email') =>
  body(field).isEmail().withMessage('Please provide a valid email address.').normalizeEmail();

/**
 * Phone validation rule: exactly 10 digits
 */
const phoneRule = (field = 'phone') =>
  body(field)
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits.');

/**
 * Non-negative number rule
 */
const nonNegativeRule = (field, label) =>
  body(field)
    .isFloat({ min: 0 })
    .withMessage(`${label} must be a non-negative number.`);

// ─── Auth Validators ─────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  emailRule('email'),
  passwordStrengthRules('password'),
  phoneRule('phone'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin.'),
  handleValidationErrors,
];

const loginValidation = [
  emailRule('email'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  passwordStrengthRules('newPassword'),
  handleValidationErrors,
];

// ─── Provider Validators ──────────────────────────────────────────────────────

const providerValidation = [
  body('name').trim().notEmpty().withMessage('Provider name is required.'),
  body('category')
    .isIn([
      'Plumber',
      'Electrician',
      'Carpenter',
      'AC Technician',
      'Appliance Repair',
      'Painter',
      'House Cleaning',
    ])
    .withMessage('Category must be a valid service category.'),
  emailRule('email'),
  phoneRule('phone'),
  body('area').trim().notEmpty().withMessage('Area is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  nonNegativeRule('experienceYears', 'Experience years'),
  nonNegativeRule('visitCharge', 'Visit charge'),
  handleValidationErrors,
];

const providerUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Provider name cannot be empty.'),
  body('category')
    .optional()
    .isIn([
      'Plumber',
      'Electrician',
      'Carpenter',
      'AC Technician',
      'Appliance Repair',
      'Painter',
      'House Cleaning',
    ])
    .withMessage('Category must be a valid service category.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits.'),
  body('area').optional().trim().notEmpty().withMessage('Area cannot be empty.'),
  body('experienceYears')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Experience years must be a non-negative number.'),
  body('visitCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Visit charge must be a non-negative number.'),
  handleValidationErrors,
];

// ─── User Validators ──────────────────────────────────────────────────────────

const userCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  emailRule('email'),
  passwordStrengthRules('password'),
  phoneRule('phone'),
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin.'),
  handleValidationErrors,
];

const userUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits.'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin.'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive.'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  providerValidation,
  providerUpdateValidation,
  userCreateValidation,
  userUpdateValidation,
};
