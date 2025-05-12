import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaUser } from 'react-icons/fa';

const ViewSubmissionDetails = () => {
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${APIEndPoints.submit_assignment.url}/assignment/${assignmentId}/${submissionId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setSubmission(response.data.submission);
        } else {
          throw new Error(response.data.message || 'Failed to fetch submission');
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load submission');
        toast.error('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId, submissionId]);

  const handleDownload = () => {
    // Implement download functionality
    toast.success('Download started');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center text-error">
        {error}
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-8 text-gray-500">
        No submission data available
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary">
        <div className="px-6 py-4 bg-secondary flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary-dark flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Submissions
          </button>
          <h2 className="text-xl font-semibold text-primary">
            Submission Details
          </h2>
          <div></div> {/* Empty div for spacing */}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {submission.title || 'Untitled Submission'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h4>
                <p className="text-gray-600">
                  {submission.description || 'No description provided'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Assignment Details
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">
                    {submission.assignment?.title || 'No title'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {submission.assignment?.description || 'No description'}
                  </p>
                  <p className="text-gray-500 text-xs flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    Deadline: {submission.assignment?.deadline ? 
                      new Date(submission.assignment.deadline).toLocaleString() : 
                      'No deadline'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Student Information
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={submission.student?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt="Student avatar"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      <FaUser className="mr-1" />
                      {submission.student?.username || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submission.student?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-tertiary">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary flex items-center"
            >
              <FaDownload className="mr-2" />
              Download Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissionDetails;