import baseApi from '@/redux/baseApi';

export const fundApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCommonFunds: builder.query({
            query: () => '/Fund/common',
        }),

        getAllFundSources: builder.query({
            query: (params) => ({
                url: '/Fund/source',
                method: 'GET',
                params: {
                    amountAdded: params.amountAdded,
                    dateAdded: params.dateAdded,
                    description: params.description,
                    fundSourceType: params.fundSourceType,
                    isAnonymous: params.isAnonymous
                }
            }),
        }),
        getAllFundUsageHistory: builder.query({
            query: (params) => ({
                url: '/Fund/usage-history',
                method: 'GET',
                params: {
                    amountUsed: params.amountUsed,
                    dateUsed: params.dateUsed,
                    purpose: params.purpose
                }
            }),
        }),

        getFundSourceById: builder.query({
            query: (id) => `/Fund/source/${id}`,
        }),



        getFundUsageHistoryById: builder.query({
            query: (id) => `/Fund/usage-history/${id}`,
        }),
        getIncomeExpenseByDateRange: builder.query({
            query: ({ startDate, endDate }) => ({
                url: '/Fund/income-expense-date-range',
                method: 'GET',
                params: {
                    startDate,
                    endDate,
                }
            }),
        }),
    }),
});

export const {
    useGetCommonFundsQuery,
    useGetAllFundSourcesQuery,
    useGetFundSourceByIdQuery,
    useGetAllFundUsageHistoryQuery,
    useGetFundUsageHistoryByIdQuery,
    useGetIncomeExpenseByDateRangeQuery,
} = fundApi;