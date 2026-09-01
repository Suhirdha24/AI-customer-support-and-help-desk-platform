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
      if (!req.file) {
        throw new ValidationError('No file uploaded.');
      }

      res.status(200).json({
        success: true,
        data: {
          fileName: req.file.originalname,
          storageKey: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedBy: req.user!.id,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attachmentController = new AttachmentController();
