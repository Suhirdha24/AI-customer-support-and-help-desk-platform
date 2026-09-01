import { User, IUser } from '../models/User.js';
import { UserRoleType } from '../constants/roles.js';

export class UserRepository {
  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<IUser | null> {
    const query = User.findById(id);
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async list(filter: Record<string, any> = {}, skip = 0, limit = 50): Promise<IUser[]> {
    return User.find(filter)
      .populate('teamIds', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return User.countDocuments(filter).exec();
  }

  async findAgents(): Promise<IUser[]> {
    return User.find({ role: 'AGENT', isActive: true })
      .populate('teamIds', 'name')
      .exec();
  }
}

export const userRepository = new UserRepository();
