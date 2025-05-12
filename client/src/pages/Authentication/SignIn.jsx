

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../../redux/user/userSlice';
import axios from 'axios';
import APIEndPoints from '../../middleware/ApiEndPoints';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../utils/api.js';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signinAPI = APIEndPoints.sign_in;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      // const response = await axios({
      //   url: signinAPI.url,
      //   method: signinAPI.method,
      //   data: formData,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   withCredentials: true
      // });

      const response = await api.post(signinAPI.url, formData); // Use the api instance

      console.log(response.data)

      if (response.data.success === false) {
        toast.error(response.data.message);
        dispatch(signInFailure(response.data.message));
        return;
      }

      dispatch(signInSuccess(response.data));
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Sign in failed';
      toast.error(errMsg);
      dispatch(signInFailure(errMsg));
    }
  };

  return (
    <div className="p-4 min-h-screen flex items-center justify-center bg-primary/40">
      <div className="w-full max-w-md bg-white/20 rounded-2xl shadow-lg border border-tertiary p-6">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-tertiary p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            id="email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-tertiary p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            id="password"
            onChange={handleChange}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-primary text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}
