import RequestFormStudent from '../../models/requestFormModels/requestFormStudent.model.js';
import { errorHandler } from '../../utils/error.js';
import { deleteImageFile, getLocalImageFilePath } from '../../utils/deleteImage.js';


const getPaginatedResults = async (model, query, page = 1, limit = 8) => {
  const startIndex = (page - 1) * limit;

  const results = await model
    .find(query)
    .skip(startIndex)
    .limit(limit)
    .exec();

  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    currentPage: page,
    totalPages,
    totalForms: total,
  };
};

export const getMonthlyRequestForms = async (req, res, next) => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();

    // Aggregate to get monthly counts
    const monthlyData = await RequestFormStudent.aggregate([
      {
        $match: {
          isDeleted: 1,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Format data for all 12 months
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(item => item._id === i + 1);
      return {
        month: i + 1,
        count: monthData ? monthData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: allMonths
    });
  } catch (error) {
    next(error);
  }
};

export const createRequestForm = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      age,
      sex,
      email,
      fatherName,
      motherName,
      permanentAddress,
      temporaryAddress,
      description,
    } = req.body;

    // Manual validation for required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'age',
      'sex',
      'email',
      'fatherName',
      'motherName',
      'permanentAddress',
      'temporaryAddress',
      'description',
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    const requestForm = new RequestFormStudent({
      firstName,
      lastName,
      age,
      sex,
      email,
      fatherName,
      motherName,
      permanentAddress,
      temporaryAddress,
      description,
    });

    const savedForm = await requestForm.save();
    res.status(201).json({
      success: true,
      data: savedForm,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create request form',
    });
  }
};

export const getAllRequestForms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    let filter = { isDeleted: 1 };



    const { results, currentPage, totalPages, totalForms } = await getPaginatedResults(
      RequestFormStudent,
      filter,
      page,
      limit
    );

    res.status(200).json({
      requestForms: results,
      currentPage,
      totalPages,
      totalForms,
    });
  } catch (error) {
    next(error);
  }
};

// Get single request form
export const getRequestForm = async (req, res, next) => {
  try {
    const requestForm = await RequestFormStudent.findById(req.params.id);
    if (!requestForm) return next(errorHandler(404, 'Request form not found!'));


    if (requestForm.isDeleted === 0) {
      return next(errorHandler(404, 'Request form is in recycle bin'));
    }

    res.status(200).json(requestForm);
  } catch (error) {
    next(error);
  }
};

// Update request form
export const updateRequestForm = async (req, res, next) => {
  try {
    const requestForm = await RequestFormStudent.findById(req.params.id);
    if (!requestForm) return next(errorHandler(404, 'Request form not found!'));


    if (requestForm.isDeleted === 0) {
      return next(errorHandler(404, 'Request form is in recycle bin'));
    }


    const updateData = {
      firstName: req.body.firstName || requestForm.firstName,
      lastName: req.body.lastName || requestForm.lastName,
      age: req.body.age || requestForm.age,
      sex: req.body.sex || requestForm.sex,
      email: req.body.email || requestForm.email,
      fatherName: req.body.fatherName || requestForm.fatherName,
      motherName: req.body.motherName || requestForm.motherName,
      permanentAddress: req.body.permanentAddress || requestForm.permanentAddress,
      temporaryAddress: req.body.temporaryAddress || requestForm.temporaryAddress,
      description: req.body.description || requestForm.description,
    };

    const updatedForm = await RequestFormStudent.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(updatedForm);
  } catch (error) {
    next(error);
  }
};

// Soft delete request form
export const deleteRequestForm = async (req, res, next) => {
  try {
    const requestForm = await RequestFormStudent.findById(req.params.id);
    if (!requestForm) return next(errorHandler(404, 'Request form not found!'));



    await RequestFormStudent.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 0,
        deletedAt: new Date(),
      }
    );

    res.status(200).json('Request form moved to recycle bin');
  } catch (error) {
    next(error);
  }
};

// Restore single request form
export const restoreRequestForm = async (req, res, next) => {
  try {

    const restoredForm = await RequestFormStudent.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: 1,
        deletedAt: null,
      },
      { new: true }
    );

    if (!restoredForm) {
      return next(errorHandler(404, 'Request form not found in recycle bin'));
    }

    res.status(200).json(restoredForm);
  } catch (error) {
    next(error);
  }
};

// Restore all deleted request forms
export const restoreAllRequestForms = async (req, res, next) => {
  try {


    const restoredForms = await RequestFormStudent.updateMany(
      { isDeleted: 0 },
      {
        isDeleted: 1,
        deletedAt: null,
      }
    );

    res.status(200).json({
      message: `${restoredForms.nModified} request forms restored successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete single request form
export const permanentDeleteRequestForm = async (req, res, next) => {
  try {


    const requestForm = await RequestFormStudent.findById(req.params.id);
    if (!requestForm) {
      return next(errorHandler(404, 'Request form not found'));
    }

    // Delete associated image if exists and not default
    if (requestForm.studentImage && !requestForm.studentImage.includes('default')) {
      try {
        const imagePath = getLocalImageFilePath(requestForm.studentImage);
        const deletionSuccess = await deleteImageFile(imagePath);
        if (!deletionSuccess) {
          console.warn(`Image deletion failed for request form ${requestForm._id}`);
        }
      } catch (err) {
        console.error(`Error during image deletion for request form ${requestForm._id}:`, err);
      }
    }

    // Delete associated PDF if exists
    if (requestForm.pdfFile) {
      try {
        const pdfPath = getLocalImageFilePath(requestForm.pdfFile);
        const deletionSuccess = await deleteImageFile(pdfPath);
        if (!deletionSuccess) {
          console.warn(`PDF deletion failed for request form ${requestForm._id}`);
        }
      } catch (err) {
        console.error(`Error during PDF deletion for request form ${requestForm._id}:`, err);
      }
    }

    await RequestFormStudent.findByIdAndDelete(req.params.id);

    res.status(200).json('Request form and associated files permanently deleted');
  } catch (error) {
    next(error);
  }
};

// Permanently delete all deleted request forms
export const deleteAllPermanently = async (req, res, next) => {
  try {


    const deletedForms = await RequestFormStudent.find({ isDeleted: 0 });
    const deletionPromises = deletedForms.map(async (form) => {
      // Delete image
      if (form.studentImage && !form.studentImage.includes('default')) {
        try {
          const imagePath = getLocalImageFilePath(form.studentImage);
          await deleteImageFile(imagePath);
        } catch (err) {
          console.error(`Image deletion failed for ${form._id}:`, err);
        }
      }
      // Delete PDF
      if (form.pdfFile) {
        try {
          const pdfPath = getLocalImageFilePath(form.pdfFile);
          await deleteImageFile(pdfPath);
        } catch (err) {
          console.error(`PDF deletion failed for ${form._id}:`, err);
        }
      }
    });

    await Promise.all(deletionPromises);
    await RequestFormStudent.deleteMany({ isDeleted: 0 });

    res.status(200).json('Recycle bin cleared (forms + associated files deleted)');
  } catch (error) {
    next(error);
  }
};

// Get deleted request forms
export const getDeletedRequestForms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;


    const { results, currentPage, totalPages, totalForms } = await getPaginatedResults(
      RequestFormStudent,
      { isDeleted: 0 },
      page,
      limit
    );

    res.status(200).json({
      deletedRequestForms: results,
      currentPage,
      totalPages,
      totalForms,
    });
  } catch (error) {
    next(error);
  }
};

