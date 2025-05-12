import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';
import { useSelector } from 'react-redux';

const EditNotification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restrict access to admins only
  const isAdmin = currentUser?.roles === 'admin';
  if (!isAdmin) {
    navigate('/'); // Redirect non-admins to dashboard
    return null;
  }

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${APIEndPoints.get_notification.url.replace(':id', id)}`, {
          withCredentials: true
        });

        // Log the response to debug the structure
        console.log('API Response:', response.data);

        // Adjust data mapping based on response structure
        const notificationData = response.data.notification || response.data;
        if (!notificationData) {
          throw new Error('Notification data not found in response');
        }

        setFormData({
          title: notificationData.title || '',
          description: notificationData.description || ''
        });
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch notification');
        toast.error(error.response?.data?.message || 'Failed to fetch notification');
        navigate('/notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to update this notification?')) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `${APIEndPoints.update_notification.url.replace(':id', id)}`,
        formData,
        {
          withCredentials: true
        }
      );

      toast.success('Notification updated successfully');
      navigate('/notifications');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update notification');
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">Edit Notification</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotification;