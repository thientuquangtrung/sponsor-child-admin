import baseApi from '@/redux/baseApi';

export const visitTripRegistrationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllVisitTripRegistrations: builder.query({
            query: () => '/VisitTripRegistrations',
        }),

        getVisitTripRegistrationById: builder.query({
            query: (id) => `/VisitTripRegistrations/${id}`,
        }),

        getVisitTripRegistrationsByUserId: builder.query({
            query: (userId) => `/VisitTripRegistrations/user/${userId}`,
        }),

        getVisitTripRegistrationsByVisitId: builder.query({
            query: (visitId) => `/VisitTripRegistrations/visit/${visitId}`,
        }),

        createVisitTripRegistration: builder.mutation({
            query: (data) => ({
                url: '/VisitTripRegistrations',
                method: 'POST',
                body: data,
            }),
        }),

        cancelVisitRegistrationTransaction: builder.mutation({
            query: (orderCode) => ({
                url: `/VisitTripRegistrations/cancel-visit-registration-transaction/${orderCode}`,
                method: 'POST',
            }),
        }),

        canRegisterForVisit: builder.query({
            query: ([userId, visitId]) => `/VisitTripRegistrations/can-register/${userId}/${visitId}`,
            method: 'GET',
        }),

        updateVisitTripRegistration: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/VisitTripRegistrations/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        calculateRefundVisit: builder.query({
            query: ({ userId, visitId }) => `/VisitTripRegistrations/calculate-refund/${userId}/${visitId}`,
            method: 'GET',
        }),
    }),
});
export const {
    useGetAllVisitTripRegistrationsQuery,
    useGetVisitTripRegistrationByIdQuery,
    useGetVisitTripRegistrationsByUserIdQuery,
    useGetVisitTripRegistrationsByVisitIdQuery,
    useCreateVisitTripRegistrationMutation,
    useCancelVisitRegistrationTransactionMutation,
    useCanRegisterForVisitQuery,
    useUpdateVisitTripRegistrationMutation,
    useCalculateRefundVisitQuery,
} = visitTripRegistrationApi;