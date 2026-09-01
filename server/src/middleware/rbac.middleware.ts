import { Request, Response, NextFunction } from 'express';
import { UserRoleType } from '../constants/roles.js';
import { AuthorizationError, AuthenticationError } from '../errors/AppError.js';

export const requireRole = (...allowedRoles: UserRoleType[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access forbidden. Role '${req.user.role}' does not have sufficient permissions for this resource.`
        )
      );
    }

    next();
  };
};
