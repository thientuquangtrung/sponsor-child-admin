import baseApi from '@/redux/baseApi';

export const disbursementRequestApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllDisbursementReport: builder.query({
            query: () => `/disbursementReport`,
        }),

        getDisbursementReportByReportId: builder.query({
            query: (reportId) => `/disbursementReport/report/${reportId}`,
        }),

        getDisbursementReportByGuaranteeId: builder.query({
            query: (guaranteeID) => `/disbursementReport/by-guarantee/${guaranteeID}`,
        }),

        updateDisbursementReport: builder.mutation({
            query: ({ id, body }) => ({
                url: `/disbursementReport/update-status/${id}`,
                method: 'PUT',
                body: body,
            }),
        }),
    }),
});

export const { useGetAllDisbursementReportQuery, useGetDisbursementReportByReportIdQuery, useGetDisbursementReportByGuaranteeIdQuery, useUpdateDisbursementReportMutation } = disbursementRequestApi;
