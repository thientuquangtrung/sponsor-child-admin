import NewPassword from '@/pages/auth/NewPassword';
import baseApi from '../baseApi';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotificationsByUserId: builder.query({
            query: (userID) => `/notification/user/${userID}`,
        }),
        markAsRead: builder.mutation({
            query: (notificationID) => ({
                url: `/notification/markAsRead/${notificationID}`,
                method: 'PUT',
            }),
        }),
        markAllAsRead: builder.mutation({
            query: (userID) => ({
                url: `/notification/markAllAsRead/${userID}`,
                method: 'PUT',
            }),
        }),
    }),
});

export const { useGetNotificationsByUserIdQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } = authApi;
