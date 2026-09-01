import { Request, Response, NextFunction } from 'express';
import { attachmentService } from '../services/attachment.service.js';
import { ValidationError } from '../errors/AppError.js';

export class AttachmentController {
  async downloadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId, attachmentId } = req.params;
      const fileInfo = await attachmentService.getAttachmentFile(
        req.user!,
        ticketId,
        attachmentId
      );

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileInfo.fileName)}"`
      );

      res.sendFile(fileInfo.filePath);
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req.files && Array.isArray(req.files) && req.files.length > 0)
        ? (req.files as Express.Multer.File[])
        : req.file ? [req.file] : [];

      if (files.length === 0) {
        throw new ValidationError('No file uploaded.');
      }

      const attachments = files.map((file) => ({
        fileName: file.originalname,
        storageKey: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: req.user!.id,
        createdAt: new Date(),
      }));

      res.status(200).json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attachmentController = new AttachmentController();
