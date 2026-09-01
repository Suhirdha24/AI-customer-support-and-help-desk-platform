import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { aiService } from '../ai/ai.service.js';

export interface TicketJobData {
  ticketId: string;
  userId?: string;
}

export class QueueService {
  private bullQueue: Queue | null = null;
  private bullWorker: Worker | null = null;
  private isRedisAvailable = false;
  private inMemoryQueue: TicketJobData[] = [];
  private isProcessingInMemory = false;

  constructor() {
    this.initQueue();
  }

  private async initQueue(): Promise<void> {
    if (env.REDIS_URL && env.REDIS_URL.trim() !== '') {
      try {
        const connection = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy(times) {
            if (times > 3) return null; // stop retrying quickly
            return 1000;
          },
        });

        connection.on('error', (err) => {
          logger.warn('Redis connection issue, continuing with in-memory worker fallback:', err.message);
          this.isRedisAvailable = false;
        });

        connection.on('connect', () => {
          logger.info('Connected to Redis for BullMQ queue processing.');
          this.isRedisAvailable = true;
          this.setupBullMQ(connection);
        });
      } catch (err: any) {
        logger.warn('Redis unavailable, using in-memory async fallback worker:', err.message);
      }
    } else {
      logger.info('Redis URL not configured. Using in-memory asynchronous worker for background AI jobs.');
    }
  }

  private setupBullMQ(connection: Redis): void {
    this.bullQueue = new Queue('ticket-ai-classification', { connection });

    this.bullWorker = new Worker(
      'ticket-ai-classification',
      async (job: Job<TicketJobData>) => {
        logger.info(`BullMQ processing AI classification job ${job.id} for ticket: ${job.data.ticketId}`);
        await aiService.classifyTicket(job.data.ticketId, job.data.userId);
      },
      { connection }
    );

    this.bullWorker.on('failed', (job, err) => {
      logger.error(`BullMQ job ${job?.id} failed:`, err);
    });
  }

  async addClassificationJob(ticketId: string, userId?: string): Promise<void> {
    if (this.isRedisAvailable && this.bullQueue) {
      try {
        await this.bullQueue.add('classify-ticket', { ticketId, userId }, {
          attempts: 2,
          backoff: { type: 'exponential', delay: 2000 },
        });
        logger.info(`Enqueued BullMQ classification job for ticket ${ticketId}`);
        return;
      } catch (err: any) {
        logger.warn('Failed to add job to BullMQ, falling back to in-memory queue:', err.message);
      }
    }

    // In-Memory Asynchronous Fallback Worker
    this.inMemoryQueue.push({ ticketId, userId });
    this.processInMemoryQueue();
  }

  private async processInMemoryQueue(): Promise<void> {
    if (this.isProcessingInMemory || this.inMemoryQueue.length === 0) {
      return;
    }

    this.isProcessingInMemory = true;

    setImmediate(async () => {
      while (this.inMemoryQueue.length > 0) {
        const job = this.inMemoryQueue.shift();
        if (!job) break;

        try {
          logger.info(`In-memory async worker running AI classification for ticket: ${job.ticketId}`);
          await aiService.classifyTicket(job.ticketId, job.userId);
          logger.info(`AI classification successfully completed for ticket: ${job.ticketId}`);
        } catch (err: any) {
          // Graceful handling: Ticket is already persisted, failure is logged without blocking core ticket flow
          logger.warn(`AI classification job failed gracefully for ticket ${job.ticketId}: ${err.message}`);
        }
      }
      this.isProcessingInMemory = false;
    });
  }
}

export const queueService = new QueueService();
