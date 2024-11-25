import baseApi from '@/redux/baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminSummary: builder.query({
            query: () => '/Admin/summary',
        }),
    }),
});

export const {
    useGetAdminSummaryQuery
} = adminApi;