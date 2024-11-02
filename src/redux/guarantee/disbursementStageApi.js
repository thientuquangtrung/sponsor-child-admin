import baseApi from '@/redux/baseApi';

export const disbursementStageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        updateDisbursementStage: builder.mutation({
            query: ({ stageId, body }) => ({
                url: `/disbursementStage/${stageId}`,
                method: 'PUT',
                body: body,
            }),
        }),
    }),
});

export const { useUpdateDisbursementStageMutation } = disbursementStageApi;