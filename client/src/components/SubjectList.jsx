import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const SubjectList = ({ apiEndpoint, deleteEndpoint, downloadVideoEndpoint, downloadPDFEndpoint }) => {
  const [subjects, setSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const fetchSubjects = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiEndpoint}?page=${page}`, {
        withCredentials: true,
      });

      const data = response.data?.subjects || [];

      setSubjects(data);
      setCurrentPage(response.data?.currentPage ? response.data.currentPage - 1 : 0);
      setTotalPages(response.data?.totalPages || 0);
      setTotalSubjects(response.data?.totalSubjects || 0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch subjects');
      toast.error(error.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(1);
  }, [apiEndpoint]);

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchSubjects(selectedPage);
  };

  const handleEdit = (subjectId) => {
    navigate(`/edit-subject/${subjectId}`);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`${deleteEndpoint}/${subjectId}`, {
          withCredentials: true,
        });
        toast.success('Subject deleted successfully');
        fetchSubjects(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete subject');
      }
    }
  };

  const handleDownloadVideo = async (subjectId, subjectName) => {
    try {
      const response = await axios.get(
        `${downloadVideoEndpoint}/${subjectId}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], { type: 'video/mp4' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${subjectName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Video downloaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download video');
    }
  };

  const handleDownloadPDF = async (subjectId, subjectName) => {
    try {
      const response = await axios.get(
        `${downloadPDFEndpoint}/${subjectId}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${subjectName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download PDF');
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
            Subjects ({totalSubjects})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-tertiary">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-tertiary">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={subject.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                            alt={subject.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.name}
                          </div>
                          {subject.video && (
                            <button
                              onClick={() => handleDownloadVideo(subject._id, subject.name)}
                              className="text-blue-500 text-sm underline flex items-center space-x-1"
                            >
                              <FaDownload className="h-4 w-4" />
                              <span>Download Video</span>
                            </button>
                          )}
                          {subject.pdf && (
                            <button
                              onClick={() => handleDownloadPDF(subject._id, subject.name)}
                              className="text-blue-500 text-sm underline flex items-center space-x-1"
                            >
                              <FaDownload className="h-4 w-4" />
                              <span>Download PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{subject.code}</td>
                    <td className="px-6 py-4">{subject.creditHours}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(subject._id)}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        title="Edit"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No subjects found
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

export default SubjectList;