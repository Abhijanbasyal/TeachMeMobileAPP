


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import APIEndPoints from '../../middleware/ApiEndPoints';
import { FaImage, FaVideo, FaFilePdf } from 'react-icons/fa';

export default function EditSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    image: '',
    video: '',
    pdf: '',
    creditHours: 3,
    isActive: true,
  });
  const [fileNames, setFileNames] = useState({
    image: '',
    video: '',
    pdf: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({
    image: false,
    video: false,
    pdf: false,
  });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${APIEndPoints.get_subject.url}/${id}`, {
          withCredentials: true,
        });
        const subject = response.data;

        setFormData({
          name: subject.name,
          code: subject.code,
          description: subject.description || '',
          image: subject.image,
          video: subject.video || '',
          pdf: subject.pdf || '',
          creditHours: subject.creditHours,
          isActive: subject.isActive,
        });

        setFileNames({
          image: subject.image ? subject.image.split('/').pop() : '',
          video: subject.video ? subject.video.split('/').pop() : '',
          pdf: subject.pdf ? subject.pdf.split('/').pop() : '',
        });
      } catch (error) {
        console.error('Error fetching subject:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch subject');
        navigate('/subject-manage');
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id, navigate]);

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const maxSize = 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} must be less than 100MB`);
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      const formData = new FormData();
      formData.append(type, file);

      const endpoint = {
        image: APIEndPoints.image_upload.url,
        video: APIEndPoints.video_upload.url,
        pdf: APIEndPoints.upload_assignment_pdf.url,
      }[type];

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setFormData((prev) => ({
        ...prev,
        [type]: response.data[type + 'Url'],
      }));
      setFileNames((prev) => ({
        ...prev,
        [type]: file.name,
      }));
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(error.response?.data?.message || `${type.charAt(0).toUpperCase() + type.slice(1)} upload failed`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to update this subject?')) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `${APIEndPoints.update_subject.url}/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      toast.success('Subject updated successfully');
      navigate('/subject-manage');
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">Edit Subject</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Subject Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Subject Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="creditHours" className="block text-sm font-medium text-gray-700">
                  Credit Hours
                </label>
                <input
                  type="number"
                  id="creditHours"
                  value={formData.creditHours}
                  onChange={handleChange}
                  min="1"
                  max="10"
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
                  rows="4"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Subject
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Media</label>
              <div className="space-y-4">
                {/* Image */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('imageInput').click()}
                    disabled={uploading.image}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <FaImage className="text-xl text-gray-700" />
                  </button>
                  <span className="text-sm text-gray-700">
                    {fileNames.image || (formData.image ? formData.image.split('/').pop() : 'Not uploaded')}
                  </span>
                  <input
                    id="imageInput"
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Video */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('videoInput').click()}
                    disabled={uploading.video}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <FaVideo className="text-xl text-gray-700" />
                  </button>
                  <span className="text-sm text-gray-700">
                    {fileNames.video || (formData.video ? formData.video.split('/').pop() : 'Not uploaded')}
                  </span>
                  <input
                    id="videoInput"
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'video')}
                    accept="video/*"
                    className="hidden"
                  />
                </div>

                {/* PDF */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('pdfInput').click()}
                    disabled={uploading.pdf}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <FaFilePdf className="text-xl text-gray-700" />
                  </button>
                  <span className="text-sm text-gray-700">
                    {fileNames.pdf || (formData.pdf ? formData.pdf.split('/').pop() : 'Not uploaded')}
                  </span>
                  <input
                    id="pdfInput"
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
                    accept="application/pdf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/subject-manage')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading.image || uploading.video || uploading.pdf}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}