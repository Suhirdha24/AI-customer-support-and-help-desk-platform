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
    const baseFilter: Record<string, any> = { status: KBStatus.PUBLISHED };
    if (categoryId) {
      baseFilter.categoryId = categoryId;
    }

    const cleanQuery = query?.trim();
    if (!cleanQuery) {
      return KnowledgeBaseArticle.find(baseFilter)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    }

    // 1. Try MongoDB full-text search first
    try {
      const textFilter = { ...baseFilter, $text: { $search: cleanQuery } };
      const textResults = await KnowledgeBaseArticle.find(textFilter, { score: { $meta: 'textScore' } })
        .populate('categoryId', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .exec();

      if (textResults && textResults.length > 0) {
        return textResults;
      }
    } catch {
      // If text index not built or query syntax issues, fall through to regex search
    }

    // 2. Multi-token Regex Fallback (matches key nouns, tags, and terms)
    const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'they', 'what', 'when', 'your', 'about']);
    const tokens = cleanQuery
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !stopWords.has(t))
      .slice(0, 5);

    if (tokens.length > 0) {
      const regexOr = tokens.flatMap((token) => [
        { title: { $regex: token, $options: 'i' } },
        { tags: { $in: [new RegExp(`^${token}`, 'i')] } },
        { content: { $regex: token, $options: 'i' } },
      ]);

      const regexResults = await KnowledgeBaseArticle.find({
        ...baseFilter,
        $or: regexOr,
      })
        .populate('categoryId', 'name')
        .limit(limit)
        .exec();

      if (regexResults && regexResults.length > 0) {
        return regexResults;
      }
    }

    // 3. Fallback to latest published articles
    return KnowledgeBaseArticle.find(baseFilter)
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
