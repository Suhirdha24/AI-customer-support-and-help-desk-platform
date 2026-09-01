import { UserRoleType } from '../constants/roles.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  teamIds?: string[];
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}
