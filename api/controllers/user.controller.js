

// import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { deleteImageFile, getLocalImageFilePath } from '../utils/deleteImage.js';



// Helper function to check role hierarchy
const canAccess = (viewerRole, targetRole) => {
  const hierarchy = {
    admin: ['admin', 'manager', 'teacher', 'student'],
    manager: ['manager', 'teacher', 'student'],
    teacher: ['teacher', 'student'],
    student: []
  };
  return hierarchy[viewerRole]?.includes(targetRole);
};

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};



export const updateUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(errorHandler(404, 'User not found'));

    // Check authorization based on roles
    const isAdmin = req.user.roles === 'admin';
    const isManager = req.user.roles === 'manager';
    const isTeacher = req.user.roles === 'teacher';
    const isStudent = req.user.roles === 'student';
    const isSelfUpdate = targetUser._id.toString() === req.user.id;


    if (!isSelfUpdate) {
      if (isManager && targetUser.roles === 'admin') {
        return next(errorHandler(403, 'Managers cannot update admin profiles'));
      }
      if (!isAdmin && !isManager) {
        return next(errorHandler(403, 'You can only update your own profile'));
      }
    }

    // Prepare update data
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      avatar: targetUser.avatar // Default to current avatar
    };

    // Handle password update if provided
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    // Handle avatar update
    if (req.body.avatar) {
      updateData.avatar = req.body.avatar.startsWith('http')
        ? req.body.avatar
        : `${process.env.SERVER_DOMAIN || 'http://localhost:8000'}${req.body.avatar}`;
    }

    // Only allow role updates by admin
    if (req.body.roles && isAdmin) {
      updateData.roles = req.body.roles;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};




export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found!'));

    // Check if current user can view the target user
    if (req.user.id !== req.params.id && !canAccess(req.user.roles, user.roles)) {
      return next(errorHandler(403, 'Unauthorized to view this user'));
    }

    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};



export const updateUserRole = async (req, res, next) => {
  try {
    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Only admins can update user roles'));
    }

    const validRoles = ['student', 'teacher', 'manager', 'admin'];
    if (!validRoles.includes(req.body.roles)) {
      return next(errorHandler(400, 'Invalid role specified'));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { roles: req.body.roles } },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------


export const restoreUser = async (req, res, next) => {
  try {
    // Only admin can restore users
    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Unauthorized to restore users'));
    }

    const restoredUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 1,
        deletedAt: null
      },
      { new: true }
    ).select('-password');

    if (!restoredUser) {
      return next(errorHandler(404, 'User not found in recycle bin'));
    }

    res.status(200).json(restoredUser);
  } catch (error) {
    next(error);
  }
};



export const permanentDeleteUser = async (req, res, next) => {
  try {
    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Unauthorized to permanently delete users'));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Delete the user's image if it exists locally
    if (user.avatar && !user.avatar.includes('default')) {
      try {
        const imagePath = getLocalImageFilePath(user.avatar);
        console.log(`Attempting to delete image at: ${imagePath}`);

        const deletionSuccess = await deleteImageFile(imagePath);
        if (!deletionSuccess) {
          console.warn(`Image deletion failed for user ${user._id}`);
        }
      } catch (err) {
        console.error(`Error during image deletion for user ${user._id}:`, err);
      }
    }

    // Delete the user from database
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json('User and associated image permanently deleted');
  } catch (error) {
    console.error('Error in permanentDeleteUser:', error);
    next(error);
  }
};



export const clearRecycleBin = async (req, res, next) => {
  try {
    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Unauthorized to clear recycle bin'));
    }

    const deletedUsers = await User.find({ isDeleted: 0 });
    const deletionPromises = deletedUsers.map(async (user) => {
      if (user.avatar && !user.avatar.includes('default')) {
        try {
          const imagePath = getLocalImageFilePath(user.avatar);
          await deleteImageFile(imagePath);
        } catch (err) {
          console.error(`Image deletion failed for ${user._id}:`, err);
        }
      }
    });

    await Promise.all(deletionPromises);
    await User.deleteMany({ isDeleted: 0 });
    
    res.status(200).json('Recycle bin cleared (users + images deleted)');
  } catch (error) {
    console.error('Recycle bin clearance failed:', error);
    next(error);
  }
};

// Modify the existing deleteUser function:
export const deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(errorHandler(404, 'User not found!'));

    // Check if current user can delete the target user
    if (req.user.id !== req.params.id &&
      !(req.user.roles === 'admin' ||
        (req.user.roles === 'manager' && targetUser.roles !== 'admin') ||
        (req.user.roles === 'teacher' && targetUser.roles === 'student'))) {
      return next(errorHandler(403, 'Unauthorized to delete this user'));
    }

    // Soft delete instead of actual delete
    await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 0,
        deletedAt: new Date()
      }
    );

    res.status(200).json('User moved to recycle bin');
  } catch (error) {
    next(error);
  }
};


// Helper function for paginated results
const getPaginatedResults = async (model, query, page = 1, limit = 8) => {
  const startIndex = (page - 1) * limit;

  const results = await model.find(query)
    .select('-password')
    .skip(startIndex)
    .limit(limit)
    .exec();

  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    currentPage: page,
    totalPages,
    totalUsers: total
  };
};

// Get all users with pagination
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    let filter = { isDeleted: 1 };

    // Apply role-based filtering
    switch (req.user.roles) {
      case 'admin':
        break;
      case 'manager':
        filter.roles = { $in: ['manager', 'teacher', 'student'] };
        break;
      case 'teacher':
        filter.roles = 'student';
        break;
      case 'student':
        return next(errorHandler(403, 'Unauthorized to view users'));
      default:
        return next(errorHandler(403, 'Unauthorized'));
    }

    const { results, currentPage, totalPages, totalUsers } = await getPaginatedResults(
      User,
      filter,
      page,
      limit
    );

    res.status(200).json({
      users: results,
      currentPage,
      totalPages,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get managers only
export const getManagers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const filter = { isDeleted: 1, roles: 'manager' };



    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Unauthorized to view managers'));
    }

    const { results, currentPage, totalPages, totalUsers } = await getPaginatedResults(
      User,
      filter,
      page,
      limit
    );

    res.status(200).json({
      managers: results,
      currentPage,
      totalPages,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get teachers only
export const getTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    let filter = { isDeleted: 1, roles: 'teacher' };

    // Only admin and managers can view teachers
    if (!['admin', 'manager'].includes(req.user.roles)) {
      return next(errorHandler(403, 'Unauthorized to view teachers'));
    }

    const { results, currentPage, totalPages, totalUsers } = await getPaginatedResults(
      User,
      filter,
      page,
      limit
    );

    res.status(200).json({
      teachers: results,
      currentPage,
      totalPages,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get students only
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    let filter = { isDeleted: 1, roles: 'student' };

    // Teachers, managers and admin can view students
    if (!['admin', 'manager', 'teacher'].includes(req.user.roles)) {
      return next(errorHandler(403, 'Unauthorized to view students'));
    }

    const { results, currentPage, totalPages, totalUsers } = await getPaginatedResults(
      User,
      filter,
      page,
      limit
    );

    res.status(200).json({
      students: results,
      currentPage,
      totalPages,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get deleted users with pagination
export const getDeletedUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;

    if (req.user.roles !== 'admin') {
      return next(errorHandler(403, 'Unauthorized to view deleted users'));
    }

    const { results, currentPage, totalPages, totalUsers } = await getPaginatedResults(
      User,
      { isDeleted: 0 },
      page,
      limit
    );

    res.status(200).json({
      deletedUsers: results,
      currentPage,
      totalPages,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};
