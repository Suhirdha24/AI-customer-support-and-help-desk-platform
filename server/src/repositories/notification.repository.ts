import { Notification, INotification } from '../models/Notification.js';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    const notif = new Notification(data);
    return notif.save();
  }

  async findByUserId(userId: string, limit = 20): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false }).exec();
  }

  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
