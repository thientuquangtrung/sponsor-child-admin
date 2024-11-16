import baseApi from '@/redux/baseApi';

export const contractApi = baseApi.injectEndpoints({
    tagTypes: ['Contract'],
    endpoints: (builder) => ({
        createContract: builder.mutation({
            query: (partyBID) => ({
                url: `/Contract/create/${partyBID}`,
                method: 'POST',
            }),
        }),
        getContractById: builder.query({
            query: (contractId) => `/Contract/${contractId}`,
            providesTags: (result, error, id) => [{ type: 'Contract', id }]

        }),
        getAllContracts: builder.query({
            query: () => '/Contract/all',
        }),
        getContractsByStatus: builder.query({
            query: (status) => `/Contract/status/${status}`,
        }),
        getContractsByUserId: builder.query({
            query: (userId) => `/Contract/user/${userId}`,
        }),
        updateContract: builder.mutation({
            query: ({ contractId, ...data }) => ({
                url: `/Contract/update/${contractId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { contractId }) => [
                { type: 'Contract', id: contractId }
            ]
        }),
    }),
});

export const {
    useCreateContractMutation,
    useGetContractByIdQuery,
    useGetAllContractsQuery,
    useGetContractsByStatusQuery,
    useGetContractsByUserIdQuery,
    useUpdateContractMutation,
} = contractApi;