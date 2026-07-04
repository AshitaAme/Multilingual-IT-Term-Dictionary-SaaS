// features/auth/constants.ts
export const AUTH_ERRORS = {
  OAUTH_ACCOUNT_NOT_LINKED: 'OAuthAccountNotLinked',
  AUTH_FAILURE: 'AuthFailure',
  AUTH_REQUIRED: 'AuthRequired',
  ADMIN_ONLY: 'AdminOnly',
} as const;

export const ROUTES = {
  SIGNIN: '/api/auth/signin',
  PROFILE: '/profile',
  PROFILE_ALL: '/profile/:path*',
  HOME: '/',
} as const;

export const LANGUAGE_CODES = ['cn', 'ja', 'en'];
