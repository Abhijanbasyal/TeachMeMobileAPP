import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  deletedNotifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    fetchNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.notifications = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchNotificationsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    fetchDeletedNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeletedNotificationsSuccess: (state, action) => {
      state.deletedNotifications = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchDeletedNotificationsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    createNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createNotificationSuccess: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      state.loading = false;
      state.error = null;
    },
    createNotificationFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateNotificationSuccess: (state, action) => {
      state.notifications = state.notifications.map((notif) =>
        notif._id === action.payload._id ? action.payload : notif
      );
      state.loading = false;
      state.error = null;
    },
    updateNotificationFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteNotificationSuccess: (state, action) => {
      state.notifications = state.notifications.filter(
        (notif) => notif._id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    deleteNotificationFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    restoreNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    restoreNotificationSuccess: (state, action) => {
      state.deletedNotifications = state.deletedNotifications.filter(
        (notif) => notif._id !== action.payload._id
      );
      state.notifications = [action.payload, ...state.notifications];
      state.loading = false;
      state.error = null;
    },
    restoreNotificationFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    restoreAllNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    restoreAllNotificationsSuccess: (state, action) => {
      state.notifications = [...action.payload, ...state.notifications];
      state.deletedNotifications = [];
      state.loading = false;
      state.error = null;
    },
    restoreAllNotificationsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    permanentDeleteNotificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    permanentDeleteNotificationSuccess: (state, action) => {
      state.deletedNotifications = state.deletedNotifications.filter(
        (notif) => notif._id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    permanentDeleteNotificationFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRecycleBinStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    clearRecycleBinSuccess: (state) => {
      state.deletedNotifications = [];
      state.loading = false;
      state.error = null;
    },
    clearRecycleBinFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  fetchDeletedNotificationsStart,
  fetchDeletedNotificationsSuccess,
  fetchDeletedNotificationsFailure,
  createNotificationStart,
  createNotificationSuccess,
  createNotificationFailure,
  updateNotificationStart,
  updateNotificationSuccess,
  updateNotificationFailure,
  deleteNotificationStart,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  restoreNotificationStart,
  restoreNotificationSuccess,
  restoreNotificationFailure,
  restoreAllNotificationsStart,
  restoreAllNotificationsSuccess,
  restoreAllNotificationsFailure,
  permanentDeleteNotificationStart,
  permanentDeleteNotificationSuccess,
  permanentDeleteNotificationFailure,
  clearRecycleBinStart,
  clearRecycleBinSuccess,
  clearRecycleBinFailure,
} = notificationSlice.actions;

export default notificationSlice.reducer;