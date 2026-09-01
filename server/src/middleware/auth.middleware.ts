import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { AuthenticationError } from '../errors/AppError.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required. Missing Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Authentication required. Token is missing.');
    }

    const user = authService.verifyToken(token);
    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated. Please contact support.');
    }

    // Real-time revocation: verify active status in database
    const dbUser = await userRepository.findById(user.id);
    if (!dbUser || !dbUser.isActive) {
      throw new AuthenticationError('Account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
