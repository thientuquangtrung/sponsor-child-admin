import baseApi from '@/redux/baseApi';

export const campaignApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllCampaigns: builder.query({
            query: () => '/campaign',
        }),
        getCampaignById: builder.query({
            query: (id) => `/campaign/${id}`,
        }),

        getCampaignEstimatedDisbursementPlan: builder.query({
            query: (id) => `/campaign/${id}/estimated-disbursement-plan`,
        }),
        createCampaign: builder.mutation({
            query: (data) => ({
                url: '/campaign',
                method: 'POST',
                body: data,
            }),
        }),
        createCampaignDisbursementPlan: builder.mutation({
            query: ({ campaignId, ...data }) => ({
                url: `/campaign/${campaignId}/create-disbursement-plan`,
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        }),

        updateCampaign: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/campaign/update/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteCampaign: builder.mutation({
            query: (id) => ({
                url: `/campaign/${id}`,
                method: 'DELETE',
            }),
        }),

        filterAdminCampaigns: builder.query({
            query: (params) => ({
                url: '/campaign/admin/filter',
                method: 'GET',
                params: {
                    title: params.title,
                    status: params.status,
                    type: params.type,
                    provinceId: params.provinceId,
                    guaranteeType: params.guaranteeType,
                    hasGuarantee: params.hasGuarantee
                }
            }),
        }),
        searchCampaigns: builder.query({
            query: (params) => ({
                url: '/campaign/search',
                method: 'GET',
                params: {
                    childName: params.childName,
                    childLocation: params.childLocation,
                    childBirthYear: params.childBirthYear,
                    childIdentificationCode: params.childIdentificationCode
                }
            }),
        }),
        cancelCampaign: builder.mutation({
            query: ({ campaignId, data }) => ({
                url: `/campaign/cancel/${campaignId}`,
                method: 'PUT',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        }),
        donateFromCommonFund: builder.mutation({
            query: ({ campaignId, ...data }) => ({
                url: `/campaign/${campaignId}/donate-from-common-fund`,
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        }),
    }),
});


export const {
    useGetAllCampaignsQuery,
    useGetCampaignByIdQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
    useFilterAdminCampaignsQuery,
    useSearchCampaignsQuery,
    useGetCampaignEstimatedDisbursementPlanQuery,
    useCreateCampaignDisbursementPlanMutation,
    useCancelCampaignMutation,
    useDonateFromCommonFundMutation,
} = campaignApi;
