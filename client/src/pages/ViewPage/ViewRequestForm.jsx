import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';

const ViewRequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${APIEndPoints.get_request_form.url}/${id}`, {
          withCredentials: true,
        });
        console.log('Fetched Form Data:', response.data);
        setForm(response.data);
      } catch (error) {
        console.error('Fetch Error:', error);
        setError(error.response?.data?.message || 'Failed to fetch request form');
        toast.error(error.response?.data?.message || 'Failed to fetch request form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleBack = () => {
    navigate('/management/request-form', { replace: true });
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

  if (!form) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center text-error">
        No request form found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-tertiary">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Request Form Details
        </h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">First Name:</p>
            <p className="text-gray-700">{form.firstName}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Last Name:</p>
            <p className="text-gray-700">{form.lastName}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Age:</p>
            <p className="text-gray-700">{form.age}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Sex:</p>
            <p className="text-gray-700">
              {form.sex ? form.sex.charAt(0).toUpperCase() + form.sex.slice(1) : 'N/A'}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Email:</p>
            <p className="text-gray-700">{form.email}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Father's Name:</p>
            <p className="text-gray-700">{form.fatherName}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Mother's Name:</p>
            <p className="text-gray-700">{form.motherName}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Permanent Address:</p>
            <p className="text-gray-700">{form.permanentAddress}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Temporary Address:</p>
            <p className="text-gray-700">{form.temporaryAddress}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Description:</p>
            <p className="text-gray-700">{form.description}</p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Created At:</p>
            <p className="text-gray-700">
              {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-primary font-medium w-40">Updated At:</p>
            <p className="text-gray-700">
              {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="mt-6 bg-secondary p-2 rounded-lg hover:bg-secondary/80 text-white"
        >
          Back to List
        </button>
      </div>
    </div>
  );
};

export default ViewRequestForm;