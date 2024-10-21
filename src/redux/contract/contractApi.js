import baseApi from '@/redux/baseApi';

export const contractApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createContract: builder.mutation({
            query: (partyBID) => ({
                url: `/Contract/create/${partyBID}`,
                method: 'POST',
            }),
        }),
        getContractById: builder.query({
            query: (contractId) => `/Contract/${contractId}`,
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