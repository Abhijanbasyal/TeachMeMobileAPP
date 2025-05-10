import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIEndPoints from '../../middleware/ApiEndPoints';


const NotificationPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [deletedNotifications, setDeletedNotifications] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${APIEndPoints.get_notifications.url}`, {
        method: APIEndPoints.get_notifications.method,
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    }
  };

  // Fetch deleted notifications
  const fetchDeletedNotifications = async () => {
    try {
      const res = await fetch(`${APIEndPoints.get_deleted_notifications.url}`, {
        method: APIEndPoints.get_deleted_notifications.method,
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeletedNotifications(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch deleted notifications');
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${APIEndPoints.update_notification.url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ isRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  // Delete notification (soft delete)
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${APIEndPoints.delete_notification.url}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
        fetchDeletedNotifications(); // Refresh deleted notifications
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  // Restore notification
  const handleRestore = async (id) => {
    try {
      const res = await fetch(`${APIEndPoints.restore_notification.url}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeletedNotifications((prev) =>
          prev.filter((notif) => notif._id !== id)
        );
        fetchNotifications(); // Refresh active notifications
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to restore notification');
    }
  };

  // Restore all notifications
  const handleRestoreAll = async () => {
    try {
      const res = await fetch(`${APIEndPoints.restore_all_notifications.url}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeletedNotifications([]);
        fetchNotifications(); // Refresh active notifications
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to restore all notifications');
    }
  };

  // Permanently delete notification
  const handlePermanentDelete = async (id) => {
    try {
      const res = await fetch(
        `${APIEndPoints.permanent_delete_notification.url}/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setDeletedNotifications((prev) =>
          prev.filter((notif) => notif._id !== id)
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to permanently delete notification');
    }
  };

  // Clear recycle bin
  const handleClearRecycleBin = async () => {
    try {
      const res = await fetch(`${APIEndPoints.clear_recycle_bin.url}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeletedNotifications([]);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to clear recycle bin');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      if (showDeleted) {
        fetchDeletedNotifications();
      }
    }
  }, [currentUser, showDeleted]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-primary mb-4">Notifications</h1>
      {error && <p className="text-error mb-4">{error}</p>}

      {/* Toggle between active and deleted notifications */}
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${
            !showDeleted ? 'bg-primary text-white' : 'bg-tertiary'
          }`}
          onClick={() => setShowDeleted(false)}
        >
          Active Notifications
        </button>
        <button
          className={`px-4 py-2 rounded ${
            showDeleted ? 'bg-primary text-white' : 'bg-tertiary'
          }`}
          onClick={() => setShowDeleted(true)}
        >
          Deleted Notifications
        </button>
      </div>

      {/* Active Notifications */}
      {!showDeleted && (
        <div>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No active notifications</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 mb-2 rounded shadow ${
                  notif.isRead ? 'bg-tertiary' : 'bg-secondary text-white'
                }`}
              >
                <p className="font-semibold">{notif.message}</p>
                <p className="text-sm">
                  To: {notif.recipient?.username || 'Unknown'}
                </p>
                <p className="text-sm">Type: {notif.type}</p>
                <div className="mt-2">
                  {!notif.isRead && (
                    <button
                      className="mr-2 px-2 py-1 bg-primary text-white rounded"
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="px-2 py-1 bg-error text-white rounded"
                    onClick={() => handleDelete(notif._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Deleted Notifications */}
      {showDeleted && (
        <div>
          <div className="mb-4">
            <button
              className="mr-2 px-4 py-2 bg-primary text-white rounded"
              onClick={handleRestoreAll}
              disabled={deletedNotifications.length === 0}
            >
              Restore All
            </button>
            <button
              className="px-4 py-2 bg-error text-white rounded"
              onClick={handleClearRecycleBin}
              disabled={deletedNotifications.length === 0}
            >
              Clear Recycle Bin
            </button>
          </div>
          {deletedNotifications.length === 0 ? (
            <p className="text-gray-500">No deleted notifications</p>
          ) : (
            deletedNotifications.map((notif) => (
              <div
                key={notif._id}
                className="p-4 mb-2 rounded shadow bg-tertiary"
              >
                <p className="font-semibold">{notif.message}</p>
                <p className="text-sm">
                  To: {notif.recipient?.username || 'Unknown'}
                </p>
                <p className="text-sm">Type: {notif.type}</p>
                <div className="mt-2">
                  <button
                    className="mr-2 px-2 py-1 bg-primary text-white rounded"
                    onClick={() => handleRestore(notif._id)}
                  >
                    Restore
                  </button>
                  <button
                    className="px-2 py-1 bg-error text-white rounded"
                    onClick={() => handlePermanentDelete(notif._id)}
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;