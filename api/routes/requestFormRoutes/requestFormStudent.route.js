import express from 'express';
import {
  createRequestForm,
  getAllRequestForms,
  getRequestForm,
  updateRequestForm,
  deleteRequestForm,
  restoreRequestForm,
  restoreAllRequestForms,
  permanentDeleteRequestForm,
  deleteAllPermanently,
  getDeletedRequestForms,
  getMonthlyRequestForms
} from '../../controllers/requestFormController/requestFormStudent.controller.js';



const router = express.Router();

// CRUD routes with file uploads
router.get('/', getAllRequestForms);
router.get('/bin/deleted',  getDeletedRequestForms);

router.post('/', createRequestForm);
router.get('/monthly-request-forms', getMonthlyRequestForms);
router.get('/:id', getRequestForm);
router.put('/update/:id', updateRequestForm);
router.delete('/delete/:id', deleteRequestForm);

// Recycle bin routes
router.put('/bin/restore/:id', restoreRequestForm);
router.put('/bin/restore-all', restoreAllRequestForms);
router.delete('/bin/permanent/:id', permanentDeleteRequestForm);
router.delete('/bin/clear', deleteAllPermanently);

export default router;