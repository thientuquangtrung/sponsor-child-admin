import baseApi from '@/redux/baseApi';

export const guaranteeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPendingApprovalGuarantees: builder.query({
            query: () => 'Guarantee/pending-approval',
        }),

        getGuaranteeProfile: builder.query({
            query: (userId) => `Guarantee/GetGuaranteeProfile/${userId}`,
        }),

        updateGuaranteeStatus: builder.mutation({
            query: ({ userId, status, rejectionReason }) => ({
                url: `Guarantee/UpdateGuaranteeStatus/${userId}`,
                method: 'PUT',
                params: { status, rejectionReason },
            }),
        }),


    }),
});

export const {
    useGetPendingApprovalGuaranteesQuery,
    useGetGuaranteeProfileQuery,
    useUpdateGuaranteeStatusMutation,
} = guaranteeApi;
