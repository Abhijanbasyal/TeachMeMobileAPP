


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaEdit, FaTrash, FaBook, FaDownload, FaInfoCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const AssignmentList = ({ apiEndpoint, deleteEndpoint, downloadEndpoint }) => {
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const fetchAssignments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiEndpoint}?page=${page}&limit=10`, {
        withCredentials: true,
      });

      let assignmentsData = response.data.assignments || [];

      // Filter assignments based on user role
      if (currentUser?.roles === 'teacher') {
        assignmentsData = assignmentsData.filter(
          (assignment) => assignment.educator._id === currentUser._id
        );
      } else if (currentUser?.roles === 'student') {
        assignmentsData = assignmentsData.filter(
          (assignment) => !assignment.isDeleted
        );
      }

      setAssignments(assignmentsData);
      setCurrentPage(response.data.currentPage ? response.data.currentPage - 1 : 0);
      setTotalPages(response.data.totalPages || 0);
      setTotalAssignments(response.data.totalAssignments || assignmentsData.length);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch assignments');
      toast.error(error.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(1);
  }, [apiEndpoint, currentUser?.roles]);

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchAssignments(selectedPage);
  };

  const handleEdit = (assignmentId) => {
    navigate(`/edit-assignment/${assignmentId}`);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`${deleteEndpoint}/${assignmentId}`, {
          withCredentials: true,
        });
        toast.success('Assignment deleted successfully');
        fetchAssignments(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete assignment');
      }
    }
  };

  const handleDownloadPDF = async (assignmentId, assignmentTitle) => {
    try {
      const response = await axios.get(
        `${downloadEndpoint}/${assignmentId}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assignmentTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download PDF');
    }
  };

  const handleInfo = (assignmentId) => {
    console.log(assignmentId)
    navigate(`/submitManagement/${assignmentId}`);
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
            Assignments ({totalAssignments})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-tertiary">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Educator
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-tertiary">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <FaBook className="h-10 w-10 text-secondary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.description?.substring(0, 50)}
                            {assignment.description?.length > 50 ? '...' : ''}
                          </div>
                          {assignment.pdf && (
                            <button
                              onClick={() => handleDownloadPDF(assignment._id, assignment.title)}
                              className="text-blue-500 text-sm underline flex items-center space-x-1"
                            >
                              <FaDownload className="h-4 w-4" />
                              <span>Download PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/20 text-secondary">
                        {assignment.subject?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.deadline).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.educator?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleInfo(assignment._id)}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-info/90 shadow-md hover:shadow-lg transition-all"
                        title="Submission Management"
                      >
                        <FaInfoCircle className="h-4 w-4" />
                      </button>
                      {(currentUser?.roles === 'admin' ||
                        currentUser?.roles === 'manager' ||
                        (currentUser?.roles === 'teacher' &&
                          assignment.educator._id === currentUser._id)) && (
                          <>
                            <button
                              onClick={() => handleEdit(assignment._id)}
                              className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(assignment._id)}
                              className="bg-error text-white p-2 rounded-lg hover:bg-error/90 shadow-md hover:shadow-lg transition-all"
                              title="Delete"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No assignments found
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
              next olenLabel={'Next'}
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

export default AssignmentList;