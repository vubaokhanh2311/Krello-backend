import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ERROR_MESSAGES } from '../constants/error-messages.constant';
export const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads/avatars',
    filename: (req, file, cb) => {
      const fileExtName = extname(file.originalname);
      const fileName = `${uuid()}${fileExtName}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(new Error(ERROR_MESSAGES.UPLOAD_FILE.ERROR), false);
    } else {
      cb(null, true);
    }
  },
};
