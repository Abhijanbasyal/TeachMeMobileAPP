import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A notification must have a title'],
  },
  description: {
    type: String,
    required: [true, 'A notification must have a description'],
  },
  isDeleted: {
    type: Number,
    default: 1, // 1 for not deleted, 0 for deleted
    enum: [0, 1]
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A notification must be associated with a user']
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;