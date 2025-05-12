


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const NotificationList = ({ apiEndpoint, deleteEndpoint }) => {
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

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiEndpoint}?page=${page}`, {
        withCredentials: true,
      });

      const data = response.data?.notifications || [];

      setNotifications(data);
      setCurrentPage(response.data?.currentPage ? response.data.currentPage - 1 : 0);
      setTotalPages(response.data?.totalPages || 0);
      setTotalNotifications(response.data?.totalNotifications || 0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch notifications');
      toast.error(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [apiEndpoint]);

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchNotifications(selectedPage);
  };

  const handleEdit = (notificationId) => {
    navigate(`/editNotification/${notificationId}`);
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`${deleteEndpoint.replace(':id', notificationId)}`, {
          withCredentials: true,
        });
        toast.success('Notification deleted successfully');
        fetchNotifications(currentPage + 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete notification');
      }
    }
  };

  // Truncate description to 50 characters
  const truncateDescription = (text) => {
    if (text?.length <= 50) return text || '';
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
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">
            Notifications ({totalNotifications})
          </h2>
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
                  Created At
                </th>
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
                    <td className="px-6 py-4">{truncateDescription(notification.description)}</td>
                    <td className="px-6 py-4">
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
                    </td>
                    {/* <td className="px-6 py-4">
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
                    </td> */}
                    <td className="px-6 py-4">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(notification._id)}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        title="Edit"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification._id)}
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
                    No notifications found
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

export default NotificationList;