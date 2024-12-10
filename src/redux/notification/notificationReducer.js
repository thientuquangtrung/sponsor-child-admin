import { createSlice } from '@reduxjs/toolkit';
import { revertAll } from '../globalActions';

// ----------------------------------------------------------------------

const initialState = {
    notifications: [],
};

export const slice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications(state, action) {
            state.notifications = action.payload;
        },
        newNotification(state, action) {
            state.notifications.unshift(action.payload);
        },
        markAsRead(state, action) {
            state.notifications = state.notifications.map((notification) =>
                notification.id === action.payload ? { ...notification, isRead: true } : notification,
            );
        },
        markAllAsRead(state, action) {
            state.notifications = state.notifications.map((notification) => ({ ...notification, isRead: true }));
        },
    },
    extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
});

// Reducer
export default slice.reducer;
