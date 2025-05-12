import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaUser,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaBook,
  FaFileAlt,
  FaSignOutAlt,
  FaTrashAlt,
  FaEdit
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { deleteUserFailure, deleteUserSuccess, signOutUserStart } from '../redux/user/userSlice';
import APIEndPoints from '../middleware/ApiEndPoints';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const Sidebar = ({ isOpen, toggleSidebar, isPermanent }) => {
  const [openSections, setOpenSections] = useState({
    roles: false,
    management: false,
    edit: false,
    forms: false,
    recycleBin: false
  });
  const sidebarRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const menuTitleActive = 'bg-primary/40 text-primary';
  const menuTitleInactive = 'hover:bg-tertiary text-primary';
  const subMenuActive = 'bg-tertiary text-primary';
  const subMenuInactive = 'hover:bg-tertiary text-primary';

  const signOutUrl = APIEndPoints.sign_out;
  const canAccessForms = ['admin', 'manager'].includes(currentUser?.roles);
  const isAdmin = currentUser?.roles === 'admin';

  useEffect(() => {
    const path = location.pathname;
    setOpenSections({
      roles: path.includes('/managers') || path.includes('/teachers') || path.includes('/students'),
      management: path.includes('/management'),
      edit: (path.includes('/subject-manage') || path.includes('/assignments') || path.includes('/notifications') || path.includes('/editNotification')) && !path.includes('/recycle-bin'),
      forms: path.includes('/forms') || path.includes('/sign-up') || path.includes('/subjectForm') || path.includes('/assignemntForm') || path.includes('/requestForm') || path.includes('/notificationForm'),
      recycleBin: path.includes('/recycle-bin')
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLinkClick = () => {
    if (!isPermanent) {
      toggleSidebar();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

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
    <>
      {!isPermanent && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {(isOpen || isPermanent) && (
          <motion.div
            ref={sidebarRef}
            initial={isPermanent ? { x: 0 } : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween' }}
            className={`fixed lg:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-50 ${isPermanent ? 'lg:flex' : ''}`}
          >
            <div className="p-4 h-full flex flex-col">
              <Link to='/'>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-primary">Teach Me</h2>
                  {!isPermanent && (
                    <button
                      onClick={toggleSidebar}
                      className="text-gray-500 hover:text-primary p-1"
                      aria-label="Close sidebar"
                    >
                      <FaTimes size={20} />
                    </button>
                  )}
                </div>
              </Link>

              {/* Navigation Items */}
              <nav className="flex-grow overflow-y-auto">
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/"
                      className={`flex items-center p-3 rounded-lg ${isActive('/') ? menuTitleActive : menuTitleInactive}`} // Updated to match the route
                      onClick={handleLinkClick}
                    >
                      <MdDashboard className="mr-3" size={20} />
                      Dashboard
                    </Link>
                  </li>

                  {/* Roles Section */}
                  <li>
                    <button
                      onClick={() => toggleSection('roles')}
                      className={`flex items-center justify-between w-full p-3 rounded-lg ${openSections.roles ? menuTitleActive : menuTitleInactive}`}
                    >
                      <div className="flex items-center">
                        <FaUser className="mr-3" size={18} />
                        Roles
                      </div>
                      {openSections.roles ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </button>
                    <AnimatePresence>
                      {openSections.roles && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-10"
                        >
                          <li><Link to="/managers" className={`flex items-center p-3 rounded-lg ${isActive('/managers') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Managers</Link></li>
                          <li><Link to="/teachers" className={`flex items-center p-3 rounded-lg ${isActive('/teachers') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Teachers</Link></li>
                          <li><Link to="/students" className={`flex items-center p-3 rounded-lg ${isActive('/students') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Students</Link></li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Management Section */}
                  <li>
                    <button
                      onClick={() => toggleSection('management')}
                      className={`flex items-center justify-between w-full p-3 rounded-lg ${openSections.management ? menuTitleActive : menuTitleInactive}`}
                    >
                      <div className="flex items-center">
                        <FaChalkboardTeacher className="mr-3" size={18} />
                        Management
                      </div>
                      {openSections.management ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </button>
                    <AnimatePresence>
                      {openSections.management && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-10"
                        >
                          <li><Link to="/management/roles" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/management/roles') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Roles</Link></li>
                          <li><Link to="/management/request-form" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/management/request-form') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>RequestForm</Link></li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Edit Section (Only for Admin & Manager) */}
                  {canAccessForms && (
                    <li>
                      <button
                        onClick={() => toggleSection('edit')}
                        className={`flex items-center justify-between w-full p-3 rounded-lg ${openSections.edit ? menuTitleActive : menuTitleInactive}`}
                      >
                        <div className="flex items-center">
                          <FaBook className="mr-3" size={18} />
                          Edit
                        </div>
                        {openSections.edit ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </button>
                      <AnimatePresence>
                        {openSections.edit && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-10"
                          >
                            <li>
                              <Link to="/subject-manage" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/subject-manage') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Manage Subject</Link>
                            </li>
                            <li>
                              <Link to="/assignments" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/assignments') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Assignment</Link>
                            </li>
                            <li>
                              <Link to="/notifications" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/notifications') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Notifications</Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )}

                  {/* Add Form Section (Only for Admin & Manager) */}
                  {canAccessForms && (
                    <li>
                      <button
                        onClick={() => toggleSection('forms')}
                        className={`flex items-center justify-between w-full p-3 rounded-lg ${openSections.forms ? menuTitleActive : menuTitleInactive}`}
                      >
                        <div className="flex items-center">
                          <FaFileAlt className="mr-3" size={18} />
                          Add Form
                        </div>
                        {openSections.forms ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </button>
                      <AnimatePresence>
                        {openSections.forms && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-10"
                          >
                            <li>
                              <Link to="/sign-up" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/sign-up') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Signup Form</Link>
                            </li>
                            <li>
                              <Link to="/subjectForm" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/subjectForm') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Subject Form</Link>
                            </li>
                            <li>
                              <Link to="/assignemntForm" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/assignemntForm') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Assignment Form</Link>
                            </li>
                            <li>
                              <Link to="/requestForm" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/requestForm') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Request Form</Link>
                            </li>
                            <li>
                              <Link to="/notificationForm" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/notificationForm') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Notification Form</Link>
                            </li>
                            <li>
                              <Link to="/submissionForm" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/submissionForm') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Submission Form</Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )}

                  {/* Recycle Bin (Only for Admin) */}
                  {isAdmin && (
                    <li>
                      <button
                        onClick={() => toggleSection('recycleBin')}
                        className={`flex items-center justify-between w-full p-3 rounded-lg ${openSections.recycleBin ? menuTitleActive : menuTitleInactive}`}
                      >
                        <div className="flex items-center">
                          <FaTrashAlt className="mr-3" size={18} />
                          Recycle Bin
                        </div>
                        {openSections.recycleBin ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </button>
                      <AnimatePresence>
                        {openSections.recycleBin && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-10"
                          >
                            <li>
                              <Link to="/recycle-bin/users" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/recycle-bin/users') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>User Bin</Link>
                            </li>
                            <li>
                              <Link to="/recycle-bin/subjects" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/recycle-bin/subjects') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Subject Bin</Link>
                            </li>
                            <li>
                              <Link to="/recycle-bin/assignments-bin" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/recycle-bin/assignments-bin') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Assignment Bin</Link>
                            </li>
                            <li>
                              <Link to="/recycle-bin/request-forms" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/recycle-bin/request-forms') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Request Bin</Link>
                            </li>
                            <li>
                              <Link to="/recycle-bin/notifications" className={`flex items-center p-2 text-sm rounded-lg ${isActive('/recycle-bin/notifications') ? subMenuActive : subMenuInactive}`} onClick={handleLinkClick}>Notification Bin</Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )}

                  {/* Profile */}
                  <li>
                    <Link
                      to="/profile"
                      className={`flex items-center p-3 rounded-lg ${isActive('/profile') ? menuTitleActive : menuTitleInactive}`}
                      onClick={handleLinkClick}
                    >
                      <FaUser className="mr-3" size={18} />
                      Profile
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Sign Out */}
              <div className="mt-auto pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-error/10 text-error transition-colors"
                >
                  <FaSignOutAlt className="mr-3" size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;