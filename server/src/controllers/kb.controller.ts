import { Request, Response, NextFunction } from 'express';
import { kbRepository } from '../repositories/kb.repository.js';
import { NotFoundError } from '../errors/AppError.js';
import mongoose from 'mongoose';

export class KBController {
  async listArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};
      // Non-admins only see PUBLISHED articles
      if (req.user?.role !== 'ADMIN') {
        filter.status = 'PUBLISHED';
      } else if (req.query.status) {
        filter.status = req.query.status;
      }

      const categoryParam = (req.query.category || req.query.categoryId) as string | undefined;
      if (categoryParam && categoryParam !== 'all') {
        if (mongoose.Types.ObjectId.isValid(categoryParam)) {
          filter.categoryId = new mongoose.Types.ObjectId(categoryParam);
        }
      }

      const [articles, total] = await Promise.all([
        kbRepository.list(filter, skip, limit),
        kbRepository.count(filter),
      ]);

      res.status(200).json({
        success: true,
        data: articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const categoryId = (req.query.category || req.query.categoryId) as string | undefined;
      const articles = await kbRepository.searchPublished(query, categoryId);

      res.status(200).json({
        success: true,
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getArticleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await kbRepository.findById(req.params.id);
      if (!article) {
        throw new NotFoundError('Knowledge base article not found.');
      }

      if (req.user?.role !== 'ADMIN' && article.status !== 'PUBLISHED') {
        throw new NotFoundError('Article not available.');
      }

      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await kbRepository.create({
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(req.user!.id),
      });

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const article = await kbRepository.update(req.params.id, {
        ...req.body,
        updatedBy: new mongoose.Types.ObjectId(req.user!.id),
      });

      if (!article) {
        throw new NotFoundError('Article not found.');
      }

      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await kbRepository.delete(req.params.id);
      if (!deleted) {
        throw new NotFoundError('Article not found.');
      }

      res.status(200).json({
        success: true,
        data: { message: 'Article deleted successfully.' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const kbController = new KBController();
