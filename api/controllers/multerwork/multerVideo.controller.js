import multer from 'multer';
import path from 'path';
import { errorHandler } from '../../utils/error.js';

const URL = process.env.FILE_URL || 'http://localhost:8000';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'api/assets/videos'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /mp4/;
  const mimetype = file.mimetype === 'video/mp4';
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(errorHandler(400, 'Only .mp4 video files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
  fileFilter,
});


export const uploadVideo = upload.single('video');


export const handleVideoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const videoUrl = `${URL}/api/assets/videos/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Video upload failed',
    });
  }
};