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

        getDisbursementStageById: builder.query({
            query: (stageId) => `/disbursementStage/${stageId}`,
        }),
    }),
});

export const { useUpdateDisbursementStageMutation, useGetDisbursementStageByIdQuery } = disbursementStageApi;