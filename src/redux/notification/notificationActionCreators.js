import { slice } from './notificationReducer';
import { revertAll } from '../globalActions';

export const NewNotification = (newNotification) => {
    return (dispatch, getState) => {
        const formattedNotification = formatNotification(newNotification);
        dispatch(slice.actions.newNotification(formattedNotification));
    };
};

export const SetNotifications = (notifications) => {
    return (dispatch, getState) => {
        const formattedNotifications = notifications.map(formatNotification);
        dispatch(slice.actions.setNotifications(formattedNotifications));
    };
};

export const MarkAsRead = (id) => {
    return (dispatch, getState) => {
        dispatch(slice.actions.markAsRead(id));
    };
};

export const MarkAllAsRead = () => {
    return (dispatch, getState) => {
        dispatch(slice.actions.markAllAsRead());
    };
};

//============== format notification functions ==============
const formatNotification = (notification) => {
    return {
        id: notification.id,
        message: notification.message,
        time: formatTime(
            new Date(new Date(notification.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString('en-US'),
        ),
        isRead: notification.isRead,
        type: notification.type,
        targetType: notification.targetType,
        targetID: notification.targetID,
        userID: notification.userID,
    };
};

const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`;
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
};
