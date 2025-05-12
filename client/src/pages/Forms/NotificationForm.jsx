import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';

const NotificationForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.description) {
      setError('Please fill in both title and description');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        APIEndPoints.create_notification.url,
        {
          title: formData.title,
          description: formData.description,
          userId: currentUser._id,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Notification created successfully!');
        setFormData({ title: '', description: '' });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create notification';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary max-w-2xl mx-auto">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">Create New Notification</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Notification Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Notification Description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <div className="flex justify-end gap-4 pt-4 border-t border-tertiary">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border bg-error/60 hover:bg-error border-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-70 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;