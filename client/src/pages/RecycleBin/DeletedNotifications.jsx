import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaTrashRestore, FaTrash } from 'react-icons/fa';
import APIEndPoints from '../../middleware/ApiEndPoints';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DeletedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Restrict access to admins only
  const isAdmin = currentUser?.roles === 'admin';
  if (!isAdmin) {
    navigate('/'); // Redirect non-admins to dashboard
    return null;
  }

  const apiDeletedNotifications = APIEndPoints.get_deleted_notifications.url;
  const apiRestoreNotification = APIEndPoints.restore_notification.url;
  const apiPermanentDelete = APIEndPoints.permanent_delete_notification.url;
  const apiClearRecycleBin = APIEndPoints.delete_all_permanently.url;

  const fetchDeletedNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${apiDeletedNotifications}?page=${page}`, {
        withCredentials: true,
      });

      const data = res.data || {};
      setNotifications(data.deletedNotifications || []); // Use deletedNotifications
      setCurrentPage(data.currentPage ? data.currentPage - 1 : 0);
      setTotalPages(data.totalPages || 0);
      setTotalNotifications(data.totalNotifications || 0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch deleted notifications');
      toast.error(error.response?.data?.message || 'Failed to fetch deleted notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedNotifications(1);
  }, []);

  const handlePageClick = (data) => {
    fetchDeletedNotifications(data.selected + 1);
  };

  const handleRestore = async (notificationId) => {
    if (window.confirm('Are you sure you want to restore this notification?')) {
      try {
        await axios.put(`${apiRestoreNotification.replace(':id', notificationId)}`, {}, {
          withCredentials: true,
        });
        toast.success('Notification restored successfully');
        fetchDeletedNotifications(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to restore notification');
      }
    }
  };

  const handlePermanentDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to permanently delete this notification? This action cannot be undone!')) {
      try {
        await axios.delete(`${apiPermanentDelete.replace(':id', notificationId)}`, {
          withCredentials: true,
        });
        toast.success('Notification permanently deleted');
        fetchDeletedNotifications(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete notification');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to permanently delete ALL notifications in the recycle bin? This action cannot be undone!')) {
      try {
        await axios.delete(apiClearRecycleBin, { withCredentials: true });
        toast.success('Recycle bin cleared successfully');
        fetchDeletedNotifications(1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to clear recycle bin');
      }
    }
  };

  // Truncate description to 50 characters
  const truncateDescription = (text) => {
    if (!text || text.length <= 50) return text || '';
    return text.substring(0, 50) + '...';
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
            Notification Recycle Bin ({totalNotifications})
          </h2>
          <button
            onClick={handleClearAll}
            disabled={totalNotifications === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              totalNotifications === 0
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
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Created By
                </th>
                {/* <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Modified By
                </th> */}
                <th className="px-6 py-3 text-left text-sm font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-tertiary">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {truncateDescription(notification.description)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {notification.createdBy ? (
                          <span>
                            {notification.createdBy.username}{' '}
                            <span className="capitalize">
                              ({notification.createdBy.roles})
                            </span>
                          </span>
                        ) : (
                          'Unknown'
                        )}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {notification.modifiedBy ? (
                          <span>
                            {notification.modifiedBy.username}{' '}
                            <span className="capitalize">
                              ({notification.modifiedBy.roles})
                            </span>
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleRestore(notification._id)}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        title="Restore"
                      >
                        <FaTrashRestore className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(notification._id)}
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
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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

export default DeletedNotifications;