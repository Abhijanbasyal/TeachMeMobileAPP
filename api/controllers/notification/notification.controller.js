import Notification from '../../models/notificationmodels/notification.model.js';
import { errorHandler } from '../../utils/error.js';
import User from '../../models/user.model.js';

const getPaginatedResults = async (model, query, page = 1, limit = 8) => {
  const startIndex = (page - 1) * limit;

  const results = await model
    .find(query)
    .populate('createdBy', 'username roles')
    .populate('modifiedBy', 'username roles')
    .skip(startIndex)
    .limit(limit)
    .exec();

  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    currentPage: page,
    totalPages,
    totalNotifications: total,
  };
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, description, userId } = req.body;

    // Manual validation for required fields
    const requiredFields = ['title', 'description', 'userId'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Check if userId exists in the User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId: User does not exist',
      });
    }

    const newNotification = new Notification({
      title,
      description,
      isDeleted: 1,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const savedNotification = await newNotification.save();
    res.status(201).json({
      success: true,
      data: savedNotification,
    });
  } catch (error) {
    next(errorHandler(400, error.message || 'Failed to create notification'));
  }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const filter = { isDeleted: 1 };

    const { results, currentPage, totalPages, totalNotifications } = await getPaginatedResults(
      Notification,
      filter,
      page,
      limit
    );

    res.status(200).json({
      notifications: results,
      currentPage,
      totalPages,
      totalNotifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get single notification
export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(errorHandler(404, 'Notification not found!'));

    if (notification.isDeleted === 0) {
      return next(errorHandler(404, 'Notification is in recycle bin'));
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// Update notification
export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(errorHandler(404, 'Notification not found!'));

    if (notification.isDeleted === 0) {
      return next(errorHandler(404, 'Notification is in recycle bin'));
    }

    const userId =  req.user?.id ; 
    console.log(userId);
    if (!userId) {
      return next(errorHandler(400, 'User ID is required to update notification'));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(400, 'Invalid user ID'));
    }

    const updateData = {
      title: req.body.title || notification.title,
      description: req.body.description || notification.description,
      updatedAt: Date.now()
    };

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

// Soft delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(errorHandler(404, 'Notification not found!'));

    await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 0,
        updatedAt: Date.now()
      }
    );

    res.status(200).json('Notification moved to recycle bin');
  } catch (error) {
    next(error);
  }
};

// Restore single notification
export const restoreNotification = async (req, res, next) => {
  try {
    const restoredNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 1,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!restoredNotification) {
      return next(errorHandler(404, 'Notification not found in recycle bin'));
    }

    res.status(200).json(restoredNotification);
  } catch (error) {
    next(error);
  }
};

// Restore all deleted notifications
export const restoreAllNotifications = async (req, res, next) => {
  try {
    const restoredNotifications = await Notification.updateMany(
      { isDeleted: 0 },
      {
        isDeleted: 1,
        updatedAt: Date.now()
      }
    );

    res.status(200).json({
      message: `${restoredNotifications.nModified} notifications restored successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete single notification
export const permanentDeleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json('Notification permanently deleted');
  } catch (error) {
    next(error);
  }
};

// Permanently delete all deleted notifications
export const deleteAllPermanently = async (req, res, next) => {
  try {
    await Notification.deleteMany({ isDeleted: 0 });

    res.status(200).json('Recycle bin cleared (notifications deleted)');
  } catch (error) {
    next(error);
  }
};

// Get deleted notifications
export const getDeletedNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const filter = { isDeleted: 0 }

    const { results, currentPage, totalPages, totalNotifications } = await getPaginatedResults(
      Notification,
      filter,
      page,
      limit
    );

    res.status(200).json({
      deletedNotifications: results,
      currentPage,
      totalPages,
      totalNotifications,
    });
  } catch (error) {
    next(error);
  }
};