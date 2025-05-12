import express from 'express';
import { 
  createNotification,
  getAllNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  restoreNotification,
  restoreAllNotifications,
  permanentDeleteNotification,
  deleteAllPermanently,
  getDeletedNotifications
} from '../../controllers/notification/notification.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';


const router = express.Router();

router.get('/', getAllNotifications);
router.get('/deleted', getDeletedNotifications);

router.post('/create', createNotification);

router.get('/:id', getNotification);
router.put('/:id',verifyToken, updateNotification);
router.delete('/:id', deleteNotification);

router.put('/restore/:id', restoreNotification);
router.put('/restore-all', restoreAllNotifications);
router.delete('/permanent-delete/:id', permanentDeleteNotification);
router.delete('/delete-all', deleteAllPermanently);

export default router;