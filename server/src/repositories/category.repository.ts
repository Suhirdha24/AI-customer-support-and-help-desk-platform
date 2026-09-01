import { Category, ICategory } from '../models/Category.js';

export class CategoryRepository {
  async list(onlyActive = true): Promise<ICategory[]> {
    const filter = onlyActive ? { isActive: true } : {};
    return Category.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  }

  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(data);
    return category.save();
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }
}

export const categoryRepository = new CategoryRepository();
