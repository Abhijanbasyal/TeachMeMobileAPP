// controllers/assignment.controller.js

import Assignment from '../../models/assignmentmodels/assignment.model.js';
import Subject from '../../models/degreemodels/subject.model.js'
import { errorHandler } from '../../utils/error.js';
import User from '../../models/user.model.js';
import { getLocalFilePath, deleteFile } from '../../utils/deleteFile.js';

// Helper function for paginated results
const getPaginatedAssignmentsHelper = async (query, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;

  const results = await Assignment.find(query)
    .populate('subject', 'name')
    .populate('educator', 'username email roles')
    .skip(startIndex)
    .limit(limit)
    .exec();

  const total = await Assignment.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    currentPage: page,
    totalPages,
    totalAssignments: total,
  };
};


export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, deadline, subjectId } = req.body;

    console.log(req.user)

    // Ensure req.user exists
    if (!req.user) {
      return next(errorHandler(401, 'Not authenticated'));
    }

    const educatorId = req.user.id;
    console.log('Looking for educator with ID:', educatorId); // Debug log


    // Validate educator exists and has proper role
    const educator = await User.findById(educatorId);
    console.log('Found educator:', educator); // Debug log

    if (!educator) {
      return next(errorHandler(404, `Educator not found with ID: ${educatorId}`));
    }

    // Check if educator has any of the allowed roles
    const allowedRoles = ['admin', 'teacher', 'manager'];
    if (!educator.roles || !allowedRoles.includes(educator.roles)) {
      return next(errorHandler(403, 'Unauthorized to create assignments'));
    }

    // Validate subject exists
    const subjectExists = await Subject.findById(subjectId);

    console.log(subjectExists)

    if (!subjectExists) {
      return next(errorHandler(400, 'Subject does not exist'));
    }

    // Handle PDF upload
    let pdfUrl = null;
    if (req.file) {
      pdfUrl = `${process.env.SERVER_DOMAIN || 'http://localhost:8000'}/api/assets/pdfs/${req.file.filename}`;
    }

    const newAssignment = new Assignment({
      title,
      description,
      deadline,
      subject: subjectId,
      educator: educatorId,
      pdf: pdfUrl,
    });

    const saved = await newAssignment.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// Get all assignments (with filters if needed)
export const getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ isDeleted: false })
      .populate('subject', 'name')
      .populate('educator', 'username email roles');

    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};

// Get paginated assignments
export const getPaginatedAssignments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };

    

  //   // Only show non-deleted subjects unless explicitly requested
  //   if (!showDeleted) {
  //     query.isDeleted = 1;
  // }

    const { results, currentPage, totalPages, totalAssignments } = await getPaginatedAssignmentsHelper(
      query,
      page,
      limit
    );


    console.log(results)

    res.status(200).json({
      assignments: results,
      currentPage,
      totalPages,
      totalAssignments,
    });
  } catch (err) {
    console.log(err)
  }
};

// Get assignment by ID
export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name')
      .populate('educator', 'username email roles');

    if (!assignment) return next(errorHandler(404, 'Assignment not found'));

    res.status(200).json(assignment);
  } catch (err) {
    next(err);
  }
};

// Soft delete an assignment
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!assignment) return next(errorHandler(404, 'Assignment not found'));
    res.status(200).json({ message: 'Assignment moved to recycle bin' });
  } catch (err) {
    next(err);
  }
};

// Get deleted assignments
export const getDeletedAssignments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { results, currentPage, totalPages, totalAssignments } = await getPaginatedAssignments(
      { isDeleted: true },
      page,
      limit
    );

    res.status(200).json({
      assignments: results,
      currentPage,
      totalPages,
      totalAssignments,
    });
  } catch (err) {
    next(err);
  }
};

// Restore a deleted assignment
export const restoreAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );

    if (!assignment) {
      return next(errorHandler(404, 'Deleted assignment not found'));
    }

    res.status(200).json({ message: 'Assignment restored successfully', assignment });
  } catch (err) {
    next(err);
  }
};

// Permanently delete an assignment
export const permanentDeleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next(errorHandler(404, 'Deleted assignment not found'));
    }

    // Delete associated PDF if it exists
    if (assignment.pdf) {
      try {
        const filePath = getLocalFilePath(assignment.pdf);
        await deleteFile(filePath);
      } catch (err) {
        console.error('Error deleting PDF file:', err);
      }
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Assignment permanently deleted' });
  } catch (err) {
    next(err);
  }
};

// Clear all deleted assignments
export const clearDeletedAssignments = async (req, res, next) => {
  try {
    const deletedAssignments = await Assignment.find({ isDeleted: true });
    const deletionPromises = deletedAssignments.map(async (assignment) => {
      if (assignment.pdf) {
        try {
          const filePath = getLocalFilePath(assignment.pdf);
          await deleteFile(filePath);
        } catch (err) {
          console.error(`PDF deletion failed for assignment ${assignment._id}:`, err);
        }
      }
    });

    await Promise.all(deletionPromises);
    const result = await Assignment.deleteMany({ isDeleted: true });

    res.status(200).json({
      message: `Cleared ${result.deletedCount} deleted assignments from recycle bin`,
    });
  } catch (err) {
    next(err);
  }
};