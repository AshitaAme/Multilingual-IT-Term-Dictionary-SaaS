export const REDIS_KEYS = {
  auth: {
    resetPassword: (email: string) => `auth:reset_password:${email}`,
  },
} as const;
