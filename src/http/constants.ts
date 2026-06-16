/**
 * Shared HTTP constants.
 *
 * `DEFAULT_API_BASE_URL` was hardcoded ~10 times across landing, admin, widget
 * and kiosk. Consumers should prefer their build-time env var and fall back to
 * this constant, e.g.:
 *
 *   const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
 */

/** Production backend gateway URL. */
export const DEFAULT_API_BASE_URL = 'https://api.botuyo.com'
