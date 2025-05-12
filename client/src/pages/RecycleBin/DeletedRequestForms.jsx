import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaTrashRestore, FaTrash } from 'react-icons/fa';
import APIEndPoints from '../../middleware/ApiEndPoints';

const DeletedRequestForms = () => {
  const [forms, setForms] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiDeletedForms = APIEndPoints.get_deleted_request_forms.url;
  const apiRestoreForm = APIEndPoints.restore_request_form.url;
  const apiPermanentDelete = APIEndPoints.permanent_delete_request_form.url;
  const apiClearRecycleBin = APIEndPoints.clear_request_form_recycle_bin.url;

  const fetchDeletedForms = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${apiDeletedForms}?page=${page}`, {
        withCredentials: true,
      });

      const data = res.data || {};
      setForms(data.deletedRequestForms || []);
      setCurrentPage(data.currentPage ? data.currentPage - 1 : 0);
      setTotalPages(data.totalPages || 0);
      setTotalForms(data.totalRequestForms || 0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch deleted request forms');
      toast.error(error.response?.data?.message || 'Failed to fetch deleted request forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedForms(1);
  }, []);

  const handlePageClick = (data) => {
    fetchDeletedForms(data.selected + 1);
  };

  const handleRestore = async (formId) => {
    if (window.confirm('Are you sure you want to restore this request form?')) {
      try {
        await axios.put(`${apiRestoreForm}/${formId}`, {}, { withCredentials: true });
        toast.success('Request form restored successfully');
        fetchDeletedForms(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to restore request form');
      }
    }
  };

  const handlePermanentDelete = async (formId) => {
    if (window.confirm('Are you sure you want to permanently delete this request form? This action cannot be undone!')) {
      try {
        await axios.delete(`${apiPermanentDelete}/${formId}`, { withCredentials: true });
        toast.success('Request form permanently deleted');
        fetchDeletedForms(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete request form');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to permanently delete ALL request forms in the recycle bin? This action cannot be undone!')) {
      try {
        await axios.delete(apiClearRecycleBin, { withCredentials: true });
        toast.success('Recycle bin cleared successfully');
        fetchDeletedForms(1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to clear recycle bin');
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
        <div className="px-6 py-4 bg-secondary flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">
            Request Form Recycle Bin ({totalForms})
          </h2>
          <button
            onClick={handleClearAll}
            disabled={totalForms === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              totalForms === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-error text-white hover:bg-error/90 shadow-md hover:shadow-lg'
            }`}
          >
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-tertiary">
            <thead className="bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">Sex</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-tertiary">
              {forms.length > 0 ? (
                forms.map((form) => (
                  <tr key={form._id} className="hover:bg-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {form.firstName} {form.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{form.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          form.sex === 'male'
                            ? 'bg-blue-100 text-blue-800'
                            : form.sex === 'female'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {form.sex ? form.sex.charAt(0).toUpperCase() + form.sex.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleRestore(form._id)}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        title="Restore"
                      >
                        <FaTrashRestore className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(form._id)}
                        className="bg-error text-white p-2 rounded-lg hover:bg-error/90 shadow-md hover:shadow-lg transition-all"
                        title="Permanently Delete"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Recycle bin is empty
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
              activeClassName={'bg-primary text-white'}
              previousClassName={'px-3 py-1 rounded-lg border border-tertiary hover:bg-secondary/20'}
              nextClassName={'px-3 py-1 rounded-lg border border-tertiary hover:bg-secondary/20'}
              disabledClassName={'opacity-50 cursor-not-allowed'}
              forcePage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletedRequestForms;