import baseApi from '@/redux/baseApi';

export const childProfileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createChildProfile: builder.mutation({
            query: (data) => ({
                url: '/ChildProfile/create',
                method: 'POST',
                body: data,
            }),
        }),
        getAllChildProfiles: builder.query({
            query: () => '/ChildProfile/all',
        }),
        getChildProfileById: builder.query({
            query: (childId) => `/ChildProfile/${childId}`,
        }),
        getChildProfilesByUserId: builder.query({
            query: (userId) => `/ChildProfile/user/${userId}`,
        }),
        filterChildProfiles: builder.query({
            query: (params) => ({
                url: '/ChildProfile/filter',
                params: {
                    name: params.name,
                    age: params.age,
                    gender: params.gender,
                    provinceName: params.provinceName,
                },
            }),
        }),
    }),
});

export const {
    useCreateChildProfileMutation,
    useGetAllChildProfilesQuery,
    useGetChildProfileByIdQuery,
    useGetChildProfilesByUserIdQuery,
    useFilterChildProfilesQuery,
} = childProfileApi;