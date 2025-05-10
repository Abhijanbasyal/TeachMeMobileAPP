import Notification from '../../models/notificationmodels/notification.model.js';
import { errorHandler } from '../../utils/error.js'; 

// Create a new notification
export const createNotification = async (req, res, next) => {
  try {
    const { message, recipient, type } = req.body;
    const notification = new Notification({
      message,
      recipient,
      type,
    });
    await notification.save();
    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Get all notifications (non-deleted)
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ isDeleted: 1 })
      .populate('recipient', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single notification
export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('recipient', 'username email');
    if (!notification || notification.isDeleted === 0) {
      return next(errorHandler(404, 'Notification not found'));
    }
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Update a notification (e.g., mark as read)
export const updateNotification = async (req, res, next) => {
  try {
    const { message, type, isRead } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.isDeleted === 0) {
      return next(errorHandler(404, 'Notification not found'));
    }
    notification.message = message || notification.message;
    notification.type = type || notification.type;
    notification.isRead = isRead !== undefined ? isRead : notification.isRead;
    await notification.save();
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.isDeleted === 0) {
      return next(errorHandler(404, 'Notification not found'));
    }
    notification.isDeleted = 0;
    await notification.save();
    res.status(200).json({
      success: true,
      message: 'Notification moved to recycle bin',
    });
  } catch (error) {
    next(error);
  }
};

// Get deleted notifications
export const getDeletedNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ isDeleted: 0 })
      .populate('recipient', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Restore a deleted notification
export const restoreNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.isDeleted === 1) {
      return next(errorHandler(404, 'Notification not found in recycle bin'));
    }
    notification.isDeleted = 1;
    await notification.save();
    res.status(200).json({
      success: true,
      message: 'Notification restored',
    });
  } catch (error) {
    next(error);
  }
};

// Restore all deleted notifications
export const restoreAllNotifications = async (req, res, next) => {
  try {
    await Notification.updateMany({ isDeleted: 0 }, { isDeleted: 1 });
    res.status(200).json({
      success: true,
      message: 'All notifications restored',
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a notification
export const permanentDeleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.isDeleted === 1) {
      return next(errorHandler(404, 'Notification not found in recycle bin'));
    }
    await notification.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Notification permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Clear recycle bin (permanently delete all)
export const clearRecycleBin = async (req, res, next) => {
  try {
    await Notification.deleteMany({ isDeleted: 0 });
    res.status(200).json({
      success: true,
      message: 'Recycle bin cleared',
    });
  } catch (error) {
    next(error);
  }
};