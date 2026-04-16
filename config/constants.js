// API Response Codes
const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// Order Statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
};

// Plant Categories
const PLANT_CATEGORIES = [
  'All',
  'Indoor',
  'Outdoor',
  'Flowering',
  'Succulent',
  'Herbal',
];

// Subscription Status
const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Document Types for Nursery
const DOCUMENT_TYPES = [
  'business_license',
  'gst_certificate',
  'shop_registration',
  'other',
];

// JWT Token Expiry
const JWT_EXPIRY = {
  ACCESS: '24h',
  REFRESH: '7d',
};

module.exports = {
  HTTP_CODES,
  ORDER_STATUS,
  USER_ROLES,
  PLANT_CATEGORIES,
  SUBSCRIPTION_STATUS,
  DOCUMENT_TYPES,
  JWT_EXPIRY,
};
