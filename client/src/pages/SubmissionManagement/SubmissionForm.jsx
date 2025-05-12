
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';

const SubmissionForm = ({ assignmentId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const createSubmissionEndpoint = APIEndPoints.create_submission.url;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.title) {
      setError('Please provide a title for your submission');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(
        createSubmissionEndpoint,
        { ...formData, assignmentId }, // Changed 'assignment' to 'assignmentId' to match backend
        { withCredentials: true }
      );
      toast.success('Submission created successfully');
      setFormData({ title: '', description: '' });
    } catch (err) {
      console.error('Submission error:', err); // Log full error for debugging
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary max-w-2xl mx-auto">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">Submit Assignment</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter submission title"
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
                  name="description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Add any additional details about your submission"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-tertiary">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border bg-error/60 hover:bg-error border-gray-300 rounded-lg text-gray-700 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-70 transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;