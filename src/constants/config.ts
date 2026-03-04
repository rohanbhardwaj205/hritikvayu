/** Number of items per page for product listings */
export const ITEMS_PER_PAGE = 12;

/** Maximum quantity of a single item in the cart */
export const MAX_CART_QUANTITY = 10;

/** Free shipping threshold in paise (999.00 INR) */
export const FREE_SHIPPING_THRESHOLD = 99900;

/** GST percentage applied to orders */
export const GST_PERCENTAGE = 18;

/** Default shipping cost in paise (49.00 INR) */
export const DEFAULT_SHIPPING_COST = 4900;

/** Maximum file upload size in bytes (5 MB) */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

/** Accepted image MIME types for uploads */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** Currency code used throughout the store */
export const CURRENCY = "INR";

/** Minimum order value in paise (0 = no minimum) */
export const MIN_ORDER_VALUE = 0;

/** Number of recent orders to show on the account dashboard */
export const RECENT_ORDERS_COUNT = 5;

/** Number of featured products to show on the homepage */
export const FEATURED_PRODUCTS_COUNT = 8;

/** Low stock threshold - show "only X left" badge */
export const LOW_STOCK_THRESHOLD = 5;

/** Search debounce delay in milliseconds */
export const SEARCH_DEBOUNCE_MS = 300;

/** Rate limit: max API requests per window */
export const RATE_LIMIT_MAX = 60;

/** Rate limit: window duration in milliseconds (1 minute) */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
