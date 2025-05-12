

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: 'https://play-lh.googleusercontent.com/2kD49Sc5652DmjJNf7Kh17DEXx9HiD2Zz3LsNc6929yTW6VBbGBCr-CQLoOA7iUf6hk',
    },
    video: {
      type: String,
      default: '',
    },
    pdf: {
      type: String,
      default: '',
    },
    creditHours: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Number,
      enum: [0, 1],
      default: 1,
      required: true,
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;