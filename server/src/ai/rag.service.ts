import { kbRepository } from '../repositories/kb.repository.js';
import { logger } from '../logger/logger.js';

export class RAGService {
  async retrieveGroundedContext(subject: string, description: string, limit = 3): Promise<string> {
    try {
      // Formulate query from subject and first 100 chars of description
      const query = `${subject} ${description.slice(0, 100)}`.trim();
      const articles = await kbRepository.searchPublished(query, undefined, limit);

      if (!articles || articles.length === 0) {
        return '';
      }

      const formatted = articles
        .map(
          (art, index) =>
            `--- ARTICLE ${index + 1}: ${art.title} ---\nTags: ${art.tags.join(', ')}\nContent: ${art.content}`
        )
        .join('\n\n');

      return formatted;
    } catch (err: any) {
      logger.warn('Failed to retrieve RAG knowledge base context:', err.message);
      return '';
    }
  }
}

export const ragService = new RAGService();
