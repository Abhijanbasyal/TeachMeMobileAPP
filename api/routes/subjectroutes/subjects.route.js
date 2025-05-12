import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
  searchSubjects,
  restoreSubject,
  permanentDeleteSubject,
  clearSubjectRecycleBin,
  getDeletedSubjects,
  getAllSubjectsWithoutPagination,
  downloadSubjectPDF,
  downloadSubjectVideo,
  getSubjectStats
} from '../../controllers/subjects/subjects.controller.js';
import { uploadImage } from '../../controllers/multerImage.controller.js';
import {uploadVideo} from '../../controllers/multerwork/multerVideo.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';


const router = express.Router();

router.post('/', uploadImage, uploadVideo, createSubject);
router.get('/all', getAllSubjectsWithoutPagination);
router.get('/', getAllSubjects);
router.get('/delete', getDeletedSubjects);
router.get('/search', searchSubjects);
router.get('/stats', getSubjectStats); // New route for subject stats
router.get('/:id', getSubject);
router.put('/:id',uploadImage, uploadVideo , updateSubject);
router.delete('/:id', deleteSubject);
router.post('/restore/:id', restoreSubject);
router.delete('/permanent/:id', permanentDeleteSubject);
router.delete('/recycle-bin/clear', clearSubjectRecycleBin);
router.get('/download-video/:id', verifyToken, downloadSubjectVideo);
router.get('/download-pdf/:id', verifyToken, downloadSubjectPDF);

export default router;