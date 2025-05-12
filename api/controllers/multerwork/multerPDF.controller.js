import multer from 'multer';
import path from 'path';
import { errorHandler } from '../../utils/error.js'

const URL = process.env.FILE_URL || 'http://localhost:8000';

// Storage for PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'api/assets/pdfs')); // new directory for PDFs
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for PDFs
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(errorHandler(400, 'Only PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, 
  fileFilter,
});

export const uploadPDF = upload.single('pdf');

export const handlePDFUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const pdfUrl = `${URL}/api/assets/pdfs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Upload failed',
    });
  }
};
