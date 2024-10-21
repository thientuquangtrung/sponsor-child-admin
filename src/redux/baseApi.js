import { BASE_URL } from '@/config/app';
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { LogoutUser, TokenReceived } from './auth/authActionCreators';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;
        const userId = getState().auth.user?.id;

        // If we have a token set in state, let's assume that we should be passing it.
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
            headers.set('x-client-id', userId);
        }

        headers.set('ngrok-skip-browser-warning', '69420');
        return headers;
    },
});

const baseQueryWithReAuth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401 && result.error.data?.status === 440011) {
        // get refresh token from store
        const refreshToken = api.getState().auth.refreshToken;

        // try to get a new token
        const refreshResult = await baseQuery(
            { url: '/auth/handle-refresh-token', headers: { 'x-refresh-token': refreshToken } },
            api,
            extraOptions,
        );
        if (refreshResult.data) {
            // store the new token
            api.dispatch(TokenReceived(refreshResult.data.data));
            // retry the initial query
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(LogoutUser());
        }
    }
    return result;
};

// const staggeredBaseQueryWithBailOut = retry(
//     async (args, api, extraOptions) => {
//         const result = await baseQueryWithReAuth(args, api, extraOptions);

//         // bail out of re-tries immediately if conditions are met,
//         // because we know successive re-retries would be redundant
//         if (checkBailOutConditions(result.error)) {
//             retry.fail(result.error);
//         }

//         return result;
//     },
//     {
//         maxRetries: 5,
//     },
// );

const checkBailOutConditions = (error) =>
    error?.status === 401 || (error?.status === 400 && error?.data?.status === 400400);

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReAuth,
    endpoints: (builder) => ({}),
});

export default baseApi;
