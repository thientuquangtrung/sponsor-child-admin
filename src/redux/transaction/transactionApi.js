import baseApi from '../baseApi';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTransaction: builder.query({
            query: () => '/transaction',
        }),

        getTransactionById: builder.query({
            query: (id) => `/transaction/${id}`,
        }),
    }),
});

export const {
    useGetTransactionQuery,
    useGetTransactionByIdQuery,
} = userApi;
