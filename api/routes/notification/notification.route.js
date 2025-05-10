import express from 'express';
import {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  getDeletedNotifications,
  restoreNotification,
  restoreAllNotifications,
  permanentDeleteNotification,
  clearRecycleBin,
} from '../../controllers/notification/notification.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

// CRUD Routes
router.post('/', verifyToken, createNotification); 
router.get('/', verifyToken, getNotifications); 
router.get('/:id', verifyToken, getNotification); 
router.put('/:id', verifyToken, updateNotification); 
router.delete('/:id', verifyToken, deleteNotification); 

// Recycle Bin Routes
router.get('/bin/deleted', verifyToken, getDeletedNotifications); 
router.put('/bin/restore/:id', verifyToken, restoreNotification); 
router.put('/bin/restore-all', verifyToken, restoreAllNotifications); 
router.delete('/bin/permanent/:id', verifyToken, permanentDeleteNotification); 
router.delete('/bin/clear', verifyToken, clearRecycleBin); 
export default router;