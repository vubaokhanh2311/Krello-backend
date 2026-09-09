import { diskStorage, FileFilterCallback } from 'multer';
import { extname } from 'path';
import { ERROR_MESSAGES } from '../constants/error-messages.constant';
import { Request } from 'express';

export const multerAttachmentConfig = {
  storage: diskStorage({
    destination: './public/uploads/attachments',
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const fileExtName = extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${fileExtName}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const allowedMimes = [
      'image/',
      'application/pdf',
      'application/zip',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimes.some((m) => file.mimetype.startsWith(m))) {
      cb(new Error(ERROR_MESSAGES.UPLOAD_FILE.ERROR));
    } else {
      cb(null, true);
    }
  },
};
