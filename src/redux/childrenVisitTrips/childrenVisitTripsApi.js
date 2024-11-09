import baseApi from '@/redux/baseApi';
export const childrenVisitTripsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllChildrenVisitTrips: builder.query({
            query: () => `/ChildrenVisitTrips`,
        }),
        createChildrenVisitTrips: builder.mutation({
            query: (data) => ({
                url: '/ChildrenVisitTrips',
                method: 'POST',
                body: data,
            }),
        }),
        getChildrenVisitTripsById: builder.query({
            query: (id) => `/ChildrenVisitTrips/${id}`,

        }),
        updateChildrenVisitTrips: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/ChildrenVisitTrips/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        getChildrenVisitTripsByProvince: builder.query({
            query: (province) => ({
                url: `/ChildrenVisitTrips/province`,
                params: { province }
            }),
        }),
    }),
});

export const {
    useGetAllChildrenVisitTripsQuery,
    useCreateChildrenVisitTripsMutation,
    useGetChildrenVisitTripsByIdQuery,
    useUpdateChildrenVisitTripsMutation,
    useGetChildrenVisitTripsByProvinceQuery,
} = childrenVisitTripsApi;
