import baseApi from '../baseApi';

export const adminConfigApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminConfig: builder.query({
            query: () => '/adminConfig',
        }),

        createAdminConfig: builder.mutation({
            query: (data) => ({
                url: '/adminConfig',
                method: 'POST',
                body: data,
            }),
        }),
        
        setDefaultAdminConfig: builder.mutation({
            query: (data) => ({
                url: '/adminConfig/set-default',
                method: 'POST',
                body: data,
            }),
        }),
        
        setDefaultCategoryConfig: builder.mutation({
            query: ({ categoryId }) => ({
                url: `/adminConfig/setDefault/${categoryId}`, 
                method: 'POST',
            }),
        }),

        updateAdminConfig: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/adminConfig/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        
    }),
});

export const {
    useGetAdminConfigQuery,
    useUpdateAdminConfigMutation,
    useSetDefaultAdminConfigMutation,
    useSetDefaultCategoryConfigMutation,
    useCreateAdminConfigMutation
} = adminConfigApi;
