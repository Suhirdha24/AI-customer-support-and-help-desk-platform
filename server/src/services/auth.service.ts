import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { env } from '../config/env.js';
import { IUser } from '../models/User.js';
import { UserRole, UserRoleType } from '../constants/roles.js';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../errors/AppError.js';
import { AuthUser } from '../types/express.js';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRoleType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRoleType;
    isActive: boolean;
    teamIds?: string[];
  };
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role = UserRole.CUSTOMER } = input;

    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        teamIds: user.teamIds?.map((t) => t.toString()),
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail, true);

    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        teamIds: user.teamIds?.map((t) => t.toString()),
      },
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      teamIds: user.teamIds?.map((t) => t.toString()),
    };
  }

  public generateToken(user: IUser): string {
    const payload: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      teamIds: user.teamIds?.map((t) => t.toString()),
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public verifyToken(token: string): AuthUser {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthUser;
    } catch (err) {
      throw new AuthenticationError('Invalid or expired authentication token.');
    }
  }
}

export const authService = new AuthService();
