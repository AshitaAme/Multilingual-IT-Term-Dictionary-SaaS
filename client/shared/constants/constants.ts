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

export const TAG_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
  '#F59E0B',
];
