import express from 'express';

//upload handler
import { uploadImage, handleImageUpload } from '../controllers/multerImage.controller.js';
import { uploadPDF, handlePDFUpload } from '../controllers/multerwork/multerPDF.controller.js';
import { handleVideoUpload, uploadVideo } from '../controllers/multerwork/multerVideo.controller.js';

import {verifyToken} from '../utils/verifyUser.js';

const router = express.Router();

router.post('/upload',verifyToken, uploadImage, handleImageUpload);
router.post('/upload-pdf',verifyToken,  uploadPDF, handlePDFUpload);
router.post('/upload-video',verifyToken,  uploadVideo, handleVideoUpload);

export default router;