import baseApi from '@/redux/baseApi';

export const physicalDonationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllPhysicalDonations: builder.query({
            query: (params) => ({
                url: '/PhysicalDonations/all',
                method: 'GET',
                params: {
                    giftStatus: params?.giftStatus,
                    giftDeliveryMethod: params?.giftDeliveryMethod,
                    giftType: params?.giftType,
                    amount: params?.amount,
                    createdAt: params?.createdAt
                }
            }),
        }),

        getPhysicalDonationsByUserId: builder.query({
            query: ({ userId, ...params }) => ({
                url: `/PhysicalDonations/user/${userId}`,
                method: 'GET',
                params: {
                    giftStatus: params?.giftStatus,
                    giftDeliveryMethod: params?.giftDeliveryMethod,
                    giftType: params?.giftType,
                    amount: params?.amount,
                    createdAt: params?.createdAt
                }
            }),
        }),

        getPhysicalDonationsByVisitId: builder.query({
            query: ({ visitId, ...params }) => ({
                url: `/PhysicalDonations/visit/${visitId}`,
                method: 'GET',
                params: {
                    giftStatus: params?.giftStatus,
                    giftDeliveryMethod: params?.giftDeliveryMethod,
                    giftType: params?.giftType,
                    amount: params?.amount,
                    createdAt: params?.createdAt
                }
            }),
        }),

        getPhysicalDonationById: builder.query({
            query: (id) => `/PhysicalDonations/${id}`,
        }),

        createPhysicalDonation: builder.mutation({
            query: (data) => ({
                url: '/PhysicalDonations',
                method: 'POST',
                body: data,
            }),
        }),

        updatePhysicalDonation: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/PhysicalDonations/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetAllPhysicalDonationsQuery,
    useGetPhysicalDonationsByUserIdQuery,
    useGetPhysicalDonationsByVisitIdQuery,
    useGetPhysicalDonationByIdQuery,
    useCreatePhysicalDonationMutation,
    useUpdatePhysicalDonationMutation,
} = physicalDonationApi;