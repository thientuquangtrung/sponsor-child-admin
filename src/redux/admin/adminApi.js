import baseApi from '@/redux/baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminSummary: builder.query({
            query: () => '/Admin/summary',
        }),
        getAdminDashboard: builder.query({
            query: () => '/Admin/dashboard',
        }),
    }),
});

export const {
    useGetAdminSummaryQuery,
    useGetAdminDashboardQuery,
} = adminApi;