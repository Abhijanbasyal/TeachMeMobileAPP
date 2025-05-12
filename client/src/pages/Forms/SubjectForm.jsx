

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaImage, FaVideo, FaFilePdf } from 'react-icons/fa';
import APIEndPoints from '../../middleware/ApiEndPoints';

export default function SubjectForm() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    creditHours: 3,
    isActive: true,
    image: 'https://play-lh.googleusercontent.com/2kD49Sc5652DmjJNf7Kh17DEXx9HiD2Zz3LsNc6929yTW6VBbGBCr-CQLoOA7iUf6hk',
    video: '',
    pdf: '',
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
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !['admin', 'manager'].includes(currentUser.roles)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to create this subject?')) return;

    try {
      setLoading(true);

      const subjectData = {
        ...formData,
        creditHours: Number(formData.creditHours),
      };

      const response = await axios.post(
        APIEndPoints.create_subject.url,
        subjectData,
        { withCredentials: true }
      );

      toast.success('Subject created successfully!');
      navigate('/subject-manage');
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !['admin', 'manager'].includes(currentUser.roles)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-tertiary">
        <div className="px-6 py-4 bg-secondary">
          <h2 className="text-xl font-semibold text-primary">Create New Subject</h2>
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
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Media</label>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current.click()}
                      disabled={uploading.image}
                      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <FaImage className="text-xl text-gray-700" />
                    </button>
                    <span className="text-sm text-gray-700">
                      {fileNames.image || 'No image selected'}
                    </span>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => handleFileUpload(e, 'image')}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Video Upload */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current.click()}
                      disabled={uploading.video}
                      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <FaVideo className="text-xl text-gray-700" />
                    </button>
                    <span className="text-sm text-gray-700">
                      {fileNames.video || 'No video selected'}
                    </span>
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => handleFileUpload(e, 'video')}
                      accept="video/*"
                      className="hidden"
                    />
                  </div>

                  {/* PDF Upload */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current.click()}
                      disabled={uploading.pdf}
                      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <FaFilePdf className="text-xl text-gray-700" />
                    </button>
                    <span className="text-sm text-gray-700">
                      {fileNames.pdf || 'No PDF selected'}
                    </span>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      accept="application/pdf"
                      className="hidden"
                    />
                  </div>
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
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}