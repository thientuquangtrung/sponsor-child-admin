import baseApi from '@/redux/baseApi';

export const campaignApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllCampaigns: builder.query({
            query: () => '/campaign',
        }),
        getCampaignById: builder.query({
            query: (id) => `/campaign/${id}`,
        }),
        createCampaign: builder.mutation({
            query: (data) => ({
                url: '/campaign',
                method: 'POST',
                body: data,
            }),
        }),
        updateCampaign: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/campaign/${id}`,
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
    }),
});

export const {
    useGetAllCampaignsQuery,
    useGetCampaignByIdQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
} = campaignApi;
