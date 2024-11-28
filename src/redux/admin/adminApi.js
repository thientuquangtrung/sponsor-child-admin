import baseApi from '@/redux/baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminSummary: builder.query({
            query: () => '/Admin/summary',
        }),
        getAdminDashboard: builder.query({
            query: ({ startDate, endDate }) => ({
                url: '/Admin/dashboard',
                method: 'GET',
                params: {
                    startDate,
                    endDate,
                }
            }),
        }),
    }),
});

export const {
    useGetAdminSummaryQuery,
    useGetAdminDashboardQuery,
} = adminApi;