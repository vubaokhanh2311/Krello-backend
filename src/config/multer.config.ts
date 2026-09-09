import { diskStorage, FileFilterCallback } from 'multer';
import { extname } from 'path';
import { ERROR_MESSAGES } from '../constants/error-messages.constant';
import { IMAGE_MIME_REGEX } from '../constants/file-types.constant';
import { Request } from 'express';

export const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads/avatars',
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const fileExtName = extname(file.originalname).toLowerCase();
      const timestampFileName = `${Date.now()}${fileExtName}`;
      cb(null, timestampFileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!file.mimetype.match(IMAGE_MIME_REGEX)) {
      cb(new Error(ERROR_MESSAGES.UPLOAD_FILE.ERROR));
    } else {
      cb(null, true);
    }
  },
};
