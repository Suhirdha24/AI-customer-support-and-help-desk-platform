export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
