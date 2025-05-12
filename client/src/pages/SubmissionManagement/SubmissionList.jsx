


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import APIEndPoints from '../../middleware/ApiEndPoints';

const SubmissionList = ({ assignmentId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSubmissions = async (page = 1) => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${APIEndPoints.submit_assignment.url}/assignment/${assignmentId}?page=${page}`,
        { withCredentials: true }
      );

      console.log('API Response:', response);

      // Handle different response structures
      const responseData = response.data;
      let submissionsData = [];
      let total = 0;

      if (Array.isArray(responseData)) {
        submissionsData = responseData;
        total = responseData.length;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        submissionsData = responseData.data;
        total = responseData.total || responseData.data.length;
      } else if (responseData?.submissions) {
        submissionsData = responseData.submissions;
        total = responseData.total || responseData.submissions.length;
      }

      console.log('Processed submissions data:', submissionsData);
      setSubmissions(submissionsData);
      setCurrentPage(response.data?.currentPage ? response.data.currentPage - 1 : 0);
      setTotalPages(response.data?.totalPages || 1);
      setTotalSubmissions(total);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to fetch submissions');
      toast.error(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(1);
  }, [assignmentId]);

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchSubmissions(selectedPage);
  };

  const handleView = (submissionId) => {
    navigate(`/submitManagement/${assignmentId}/submissions/${submissionId}`);
  };

  const handleDownload = (submissionId) => {
    // Implement download functionality
    console.log('Download submission:', submissionId);
    toast.success('Download started');
  };

  const handleDelete = async (submissionId) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await axios.delete(
          `${APIEndPoints.submit_assignment.url}/${submissionId}`,
          { withCredentials: true }
        );
        toast.success('Submission deleted successfully');
        fetchSubmissions(currentPage + 1);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete submission');
      }
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">
            Submissions ({totalSubmissions})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-tertiary">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-tertiary">
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.student?.username || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.student?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.title || 'Untitled Submission'}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {submission.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${submission.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleView(submission._id)}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        title="View"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(submission._id)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-info/90 shadow-md hover:shadow-lg transition-all"
                        title="Download"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="bg-error text-white p-2 rounded-lg hover:bg-error/90 shadow-md hover:shadow-lg transition-all"
                        title="Delete"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No submissions found for this assignment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-tertiary bg-tertiary">
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'flex justify-center space-x-2'}
              pageClassName={'rounded-lg border border-tertiary hover:bg-secondary/20'}
              pageLinkClassName={'text-primary px-3 py-2'}
              activeClassName={'bg-secondary'}
              previousClassName={'px-3 py-1 rounded-lg border border-tertiary bg-secondary/20 hover:bg-primary/20'}
              nextClassName={'px-3 py-1 rounded-lg border border-tertiary bg-secondary/20 hover:bg-primary/20'}
              disabledClassName={'opacity-50 cursor-not-allowed'}
              forcePage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;