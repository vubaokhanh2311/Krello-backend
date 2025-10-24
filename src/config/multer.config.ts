import { diskStorage } from 'multer';
import { extname } from 'path';
import { ERROR_MESSAGES } from '../constants/error-messages.constant';
import { IMAGE_MIME_REGEX } from '../constants/file-types.constant';

export const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads/avatars',
    filename: (req, file, cb) => {
      const fileExtName = extname(file.originalname).toLowerCase();
      const timestampFileName = `${Date.now()}${fileExtName}`;
      cb(null, timestampFileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(IMAGE_MIME_REGEX)) {
      cb(new Error(ERROR_MESSAGES.UPLOAD_FILE.ERROR), false);
    } else {
      cb(null, true);
    }
  },
};
