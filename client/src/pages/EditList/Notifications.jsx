import NotificationList from '../../components/NotificationList';
import APIEndPoints from '../../middleware/ApiEndPoints';

const Notifications = () => {
  const getNotificationsAPI = APIEndPoints.get_all_notifications.url;
  const deleteNotificationAPI = APIEndPoints.delete_notification.url;

  return (
    <NotificationList
      apiEndpoint={getNotificationsAPI}
      deleteEndpoint={deleteNotificationAPI}
    />
  );
};

export default Notifications;