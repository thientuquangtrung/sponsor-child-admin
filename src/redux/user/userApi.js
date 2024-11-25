import baseApi from '../baseApi';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUser: builder.query({
            query: () => '/users',
        }),

        getUserById: builder.query({
            query: (id) => `/users/${id}`,
        }),

        createUser: builder.mutation({
            query: (data) => ({
                url: '/users',
                method: 'POST',
                body: data,
            }),
        }),

        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),

        deleteUser: builder.mutation({
            query: ({ id, rejectionReason }) => ({
                url: `/users/${id}`,
                method: 'DELETE',
                params: { rejectionReason },
            }),
        }),

        reactivateUser: builder.mutation({
            query: (id) => ({
                url: `/users/reactivate/${id}`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useGetUserQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useReactivateUserMutation,
} = userApi;
