import express from 'express';
import { 
  test, 
  updateUser, 
  deleteUser, 
  getUser, 
  getAllUsers,
  updateUserRole,
  getDeletedUsers,
  restoreUser,
  permanentDeleteUser,
  clearRecycleBin,
  getManagers,
  getTeachers,
  getStudents,
  getDashboardStats
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Test route
router.get('/test', test);

// Paginated user lists
router.get('/', verifyToken, getAllUsers);
router.get('/managers', verifyToken, getManagers);
router.get('/teachers', verifyToken, getTeachers);
router.get('/students', verifyToken, getStudents);
router.get('/dashboard-stats', verifyToken, getDashboardStats);


// Recycle bin routes
router.get('/bin/deleted', verifyToken, getDeletedUsers);
router.put('/bin/restore/:id', verifyToken, restoreUser);
router.delete('/bin/permanent/:id', verifyToken, permanentDeleteUser);
router.delete('/bin/clear', verifyToken, clearRecycleBin);

// User CRUD operations
router.post('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/:id', verifyToken, getUser);


// Admin-only routes
router.post('/update-role/:id', verifyToken, updateUserRole);


export default router;