import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaSun, 
  FaMoon, 
  FaBell,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { signOutUserStart, deleteUserSuccess, deleteUserFailure } from '../redux/user/userSlice';
import APIEndPoints from '../middleware/ApiEndPoints';
import axios from 'axios';

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [darkMode, setDarkMode] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dispatch = useDispatch();
  const signOutUrl = APIEndPoints.sign_out;
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    if (!currentUser) return;

    const confirmSignOut = window.confirm(`Are you sure you want to sign out, ${currentUser.username}?`);
    if (!confirmSignOut) return;

    try {
      dispatch(signOutUserStart());
      const res = await axios({
        url: signOutUrl.url,
        method: signOutUrl.method
      });

      if (res.data.success === false) {
        dispatch(deleteUserFailure(res.data.message));
        return;
      }
      dispatch(deleteUserSuccess(res.data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (  
    <ul className='flex gap-6 items-center'>
      {/* Dark Mode Toggle */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setDarkMode(!darkMode)}
        className="text-primary hover:text-secondary text-xl"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </motion.button>
      
      {/* Notification */}
      <motion.div whileHover={{ scale: 1.1 }}>
        <Link to="/notifications-page" className="text-primary hover:text-secondary text-xl">
          <FaBell />
        </Link>
      </motion.div>
      
      {/* Profile with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {currentUser ? (
          <motion.div 
            className='flex items-center gap-2 cursor-pointer'
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className='hidden md:inline text-primary font-medium'>
              {currentUser.username}
            </span>
            <img
              className='rounded-full h-8 w-8 object-cover border-2 border-secondary'
              src={currentUser.avatar}
              alt='profile'
            />
            {isDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </motion.div>
        ) : (
          <Link to="/sign-in">
            <motion.li 
              className='text-primary hover:text-secondary transition-colors'
              whileHover={{ scale: 1.05 }}
            >
              <FaUser className="inline mr-1" /> Sign in
            </motion.li>
          </Link>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-tertiary"
          >
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-primary hover:bg-tertiary"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUser className="mr-2" /> Profile
              </Link>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleSignOut();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-error/10"
              >
                <FaSignOutAlt className="mr-2" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </ul>
  );
}

export default Navbar;