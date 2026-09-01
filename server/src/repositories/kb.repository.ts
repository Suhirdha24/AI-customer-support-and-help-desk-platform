import { KnowledgeBaseArticle, IKnowledgeBaseArticle } from '../models/KnowledgeBaseArticle.js';
import { KBStatus } from '../constants/ticket.constants.js';

export class KBRepository {
  async create(data: Partial<IKnowledgeBaseArticle>): Promise<IKnowledgeBaseArticle> {
    const article = new KnowledgeBaseArticle(data);
    return article.save();
  }

  async findById(id: string): Promise<IKnowledgeBaseArticle | null> {
    return KnowledgeBaseArticle.findById(id)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .exec();
  }

  async update(id: string, data: Partial<IKnowledgeBaseArticle>): Promise<IKnowledgeBaseArticle | null> {
    return KnowledgeBaseArticle.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('categoryId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await KnowledgeBaseArticle.findByIdAndDelete(id).exec();
    return !!res;
  }

  async searchPublished(query: string, categoryId?: string, limit = 10): Promise<IKnowledgeBaseArticle[]> {
    const filter: Record<string, any> = { status: KBStatus.PUBLISHED };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (query && query.trim().length > 0) {
      filter.$text = { $search: query.trim() };
      return KnowledgeBaseArticle.find(filter, { score: { $meta: 'textScore' } })
        .populate('categoryId', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .exec();
    }

    return KnowledgeBaseArticle.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async list(filter: Record<string, any> = {}, skip = 0, limit = 20): Promise<IKnowledgeBaseArticle[]> {
    return KnowledgeBaseArticle.find(filter)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return KnowledgeBaseArticle.countDocuments(filter).exec();
  }
}

export const kbRepository = new KBRepository();
