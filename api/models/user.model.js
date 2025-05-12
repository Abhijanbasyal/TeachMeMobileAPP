import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'manager'],
      required: true,
    },
    isDeleted: {
      type: Number,
      enum: [0, 1],
      default: 1, // 1 means not deleted, 0 means deleted
      required: true
    },

    avatar: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    isActive: {
      type: Boolean,
      default: true
    },
   
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
