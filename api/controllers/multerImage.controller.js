// controllers/multerImage.controller.js
import multer from 'multer';
import path from 'path';
import { errorHandler } from '../utils/error.js';

const URL = process.env.FILE_URL || 'http://localhost:8000';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'api/assets/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(errorHandler(400, 'Only images are allowed (jpeg, jpg, png, gif)'));
  }
};

// Initialize multer
const upload = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, 
  fileFilter
});

// Middleware for single file upload
export const uploadImage = upload.single('image');

// Controller function
export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `${URL}/api/assets/images/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      imageUrl, 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Upload failed',
    });
  }
};
