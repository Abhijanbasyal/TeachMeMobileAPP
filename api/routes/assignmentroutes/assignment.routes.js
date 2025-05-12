// routes/assignment.routes.js
import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  deleteAssignment,
  getPaginatedAssignments,
  getDeletedAssignments,
  restoreAssignment,
  permanentDeleteAssignment,
  clearDeletedAssignments,
  downloadAssignmentPDF,
  updateAssignment
} from '../../controllers/assigments/assignment.controller.js';
import {verifyEducator} from '../../utils/verifyEducatior.js'
import { verifyToken } from '../../utils/verifyUser.js';
import {uploadPDF } from '../../controllers/multerwork/multerPDF.controller.js'

const router = express.Router();

router.post('/',verifyToken, verifyEducator, uploadPDF , createAssignment);
router.get('/', getAllAssignments); 
router.get('/paginatedassignment', getPaginatedAssignments); // New paginated endpoint
router.get('/bin/deleted', verifyToken, verifyEducator, getDeletedAssignments);
router.get('/:id', getAssignmentById); 
router.delete('/:id', verifyToken,verifyEducator, deleteAssignment);
router.put('/:id', verifyToken, verifyEducator, uploadPDF, updateAssignment);


router.put('/bin/restore/:id', verifyToken, verifyEducator, restoreAssignment);
router.delete('/bin/permanent/:id', verifyToken, verifyEducator, permanentDeleteAssignment);
router.delete('/bin/clear', verifyToken, verifyEducator, clearDeletedAssignments);
router.get('/download/:id', verifyToken, downloadAssignmentPDF);


export default router;
