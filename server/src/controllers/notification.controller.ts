import { Request, Response, NextFunction } from 'express';
import { notificationRepository } from '../repositories/notification.repository.js';

export class NotificationController {
  async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationRepository.findByUserId(req.user!.id),
        notificationRepository.countUnread(req.user!.id),
      ]);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notif = await notificationRepository.markAsRead(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: notif,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationRepository.markAllAsRead(req.user!.id);
      res.status(200).json({
        success: true,
        data: { message: 'All notifications marked as read.' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
