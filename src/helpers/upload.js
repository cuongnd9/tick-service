import { thinid } from 'thinid';
import multer from 'multer';
import path from 'path';
import Boom from '@hapi/boom';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, `${thinid()}${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const acceptedExts = ['.png', '.jpg', '.jpeg', '.gif'];
    if (acceptedExts.indexOf(ext) === -1) {
      return callback(Boom.badRequest('Invalid image extension'));
    }
    callback(null, true);
  },
});

export default upload;
