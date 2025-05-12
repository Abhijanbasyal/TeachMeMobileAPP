// controllers/submission.controller.js

import Submission from '../../models/assignmentmodels/submission.model.js';
import Assignment from '../../models/assignmentmodels/assignment.model.js';
import { errorHandler } from '../../utils/error.js';

//  Submit an assignment
export const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, title, description } = req.body;
    // req.user._id
    // if (!req.user || !req.user._id) {
    //   return next(errorHandler(401, 'Unauthorized: Please log in to submit an assignment'));
    // }
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(errorHandler(404, 'Assignment not found'));

    // if (existingSubmission) {
    //   return next(errorHandler(400, 'You have already submitted this assignment'));
    // }

    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    const newSubmission = new Submission({
      assignment: assignmentId,
      student: studentId,
      title,
      description,
      submittedAt: now,
      status: isLate ? 'late' : 'completed'
    });

    const saved = await newSubmission.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

//  Get all submissions for a student
export const getMySubmissions = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({ student: studentId })
      .populate('assignment');

    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
};

// Get all submissions for a specific assignment (for teacher review)
export const getSubmissionsByAssignment = async (req, res, next) => {
  try {
    const assignmentId = req.params.assignmentId;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'username email');

    if (!submissions || submissions.length === 0) {
      return res.status(200).json([]); // Return empty array instead of null/undefined
    }

    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
};


// Add this new method to your existing submission controller
export const getSubmissionById = async (req, res, next) => {
  try {
    const { assignmentId, submissionId } = req.params;


    const submission = await Submission.findOne({
      _id: submissionId,
      assignment: assignmentId
    })
    .populate('student', 'username email')
    .populate('assignment', 'title description deadline');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (err) {
    next(err);
  }
};