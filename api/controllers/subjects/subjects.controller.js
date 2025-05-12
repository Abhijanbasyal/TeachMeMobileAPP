import { errorHandler } from '../../utils/error.js';
import { deleteImageFile, getLocalImageFilePath } from '../../utils/deleteImage.js';
import { getLocalFilePath, deleteFile } from '../../utils/deleteFile.js';
import fs from "fs";
import Subject from '../../models/degreemodels/subject.model.js';

// Helper function for paginated results
const getPaginatedSubjects = async (query, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;

  const results = await Subject.find(query)
    .skip(startIndex)
    .limit(limit)
    .exec();

  const total = await Subject.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    currentPage: page,
    totalPages,
    totalSubjects: total
  };
};

export const getSubjectStats = async (req, res, next) => {
  try {
    const activeCount = await Subject.countDocuments({ isActive: true, isDeleted: 1 });
    const inactiveCount = await Subject.countDocuments({ isActive: false, isDeleted: 1 });

    res.status(200).json({
      success: true,
      data: {
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    console.error('Error in getSubjectStats:', error);
    next(errorHandler(500, 'Failed to fetch subject stats'));
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, creditHours, isActive, image, video, pdf } = req.body;

    if (!name || !code) {
      return next(errorHandler(400, 'Subject name and code are required'));
    }

    const subjectData = {
      name,
      code,
      description: description || '',
      creditHours: Number(creditHours) || 3,
      isActive: isActive !== undefined ? isActive : true,
      image: image || 'https://play-lh.googleusercontent.com/2kD49Sc5652DmjJNf7Kh17DEXx9HiD2Zz3LsNc6929yTW6VBbGBCr-CQLoOA7iUf6hk',
      video: video || '',
      pdf: pdf || '',
    };

    const newSubject = new Subject(subjectData);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error in Subject Creation:', error);
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(errorHandler(404, 'Subject not found'));
    }

    const { name, code, description, creditHours, isActive, image, video, pdf } = req.body;

    const updateData = {
      name: name || subject.name,
      code: code || subject.code,
      description: description !== undefined ? description : subject.description,
      creditHours: creditHours !== undefined ? Number(creditHours) : subject.creditHours,
      isActive: isActive !== undefined ? isActive : subject.isActive,
      image: image || subject.image,
      video: video || subject.video,
      pdf: pdf || subject.pdf,
    };

    // Delete old files if new ones are provided
    if (image && image !== subject.image && subject.image && !subject.image.includes('default')) {
      const imagePath = getLocalImageFilePath(subject.image);
      await deleteImageFile(imagePath);
    }
    if (video && video !== subject.video && subject.video) {
      const videoPath = getLocalImageFilePath(subject.video);
      await deleteImageFile(videoPath);
    }
    if (pdf && pdf !== subject.pdf && subject.pdf) {
      const pdfPath = getLocalImageFilePath(subject.pdf);
      await deleteImageFile(pdfPath);
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error('Error in updateSubject:', error);
    next(error);
  }
};



export const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(errorHandler(404, 'Subject not found!'));
    }
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error in getSubject:', error);
    next(error);
  }
};



export const searchSubjects = async (req, res, next) => {
  try {
    const searchTerm = req.query.term || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const { results, currentPage, totalPages, totalSubjects } = await getPaginatedSubjects(
      query,
      page,
      limit
    );

    res.status(200).json({
      subjects: results,
      currentPage,
      totalPages,
      totalSubjects
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const showDeleted = req.query.showDeleted === 'true';

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };

    if (!showDeleted) {
      query.isDeleted = 1;
    }

    const { results, currentPage, totalPages, totalSubjects } = await getPaginatedSubjects(
      query,
      page,
      limit
    );

    res.status(200).json({
      subjects: results,
      currentPage,
      totalPages,
      totalSubjects
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(errorHandler(404, 'Subject not found'));
    }

    await Subject.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 0,
        deletedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({ message: 'Subject moved to recycle bin' });
  } catch (error) {
    next(error);
  }
};

export const restoreSubject = async (req, res, next) => {
  try {
    const restoredSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 1,
        deletedAt: null
      },
      { new: true }
    );

    if (!restoredSubject) {
      return next(errorHandler(404, 'Subject not found in recycle bin'));
    }

    res.status(200).json(restoredSubject);
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return next(errorHandler(404, 'Subject not found'));
    }

    if (subject.image && !subject.image.includes('default')) {
      try {
        const imagePath = getLocalImageFilePath(subject.image);
        await deleteImageFile(imagePath);
      } catch (err) {
        console.error('Error deleting subject image:', err);
      }
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subject permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const clearSubjectRecycleBin = async (req, res, next) => {
  try {
    const deletedSubjects = await Subject.find({ isDeleted: 0 });
    const deletionPromises = deletedSubjects.map(async (subject) => {
      if (subject.image && !subject.image.includes('default')) {
        try {
          const imagePath = getLocalImageFilePath(subject.image);
          await deleteImageFile(imagePath);
        } catch (err) {
          console.error(`Image deletion failed for subject ${subject._id}:`, err);
        }
      }
    });

    await Promise.all(deletionPromises);
    await Subject.deleteMany({ isDeleted: 0 });

    res.status(200).json({ message: 'Recycle bin cleared (subjects + images deleted)' });
  } catch (error) {
    next(error);
  }
};

export const getDeletedSubjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { results, currentPage, totalPages, totalSubjects } = await getPaginatedSubjects(
      { isDeleted: 0 },
      page,
      limit
    );

    res.status(200).json({
      deletedSubjects: results,
      currentPage,
      totalPages,
      totalSubjects
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubjectsWithoutPagination = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ isDeleted: 1 });

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};

export const downloadSubjectVideo = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return next(errorHandler(404, 'Subject not found'));
    }

    if (!subject.video) {
      return next(errorHandler(400, 'No video associated with this subject'));
    }

    const filePath = getLocalFilePath(subject.video);

    if (!fs.existsSync(filePath)) {
      return next(errorHandler(404, 'Video file not found on server'));
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${subject.name}.mp4"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const downloadSubjectPDF = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return next(errorHandler(404, 'Subject not found'));
    }

    if (!subject.pdf) {
      return next(errorHandler(400, 'No PDF associated with this subject'));
    }

    const filePath = getLocalFilePath(subject.pdf);

    if (!fs.existsSync(filePath)) {
      return next(errorHandler(404, 'PDF file not found on server'));
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${subject.name}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};