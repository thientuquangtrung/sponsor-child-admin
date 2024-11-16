import baseApi from '@/redux/baseApi';

export const disbursementRequestApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllDisbursementRequest: builder.query({
            query: () => `/disbursementRequest`,
        }),

        getDisbursementRequestById: builder.query({
            query: (id) => `/disbursementRequest/${id}/simplified`,
        }),

        updateDisbursementRequest: builder.mutation({
            query: ({ id, body }) => ({
                url: `/disbursementRequest/${id}`,
                method: 'PUT',
                body: body,
            }),
        }),
    }),
});

export const {
    useGetAllDisbursementRequestQuery,
    useGetDisbursementRequestByIdQuery,
    useUpdateDisbursementRequestMutation,
} = disbursementRequestApi;
