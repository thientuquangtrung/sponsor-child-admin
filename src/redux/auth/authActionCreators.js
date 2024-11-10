import { slice } from './authReducer';
import { revertAll } from '../globalActions';

export const UpdateUser = ({ user }) => {
    return (dispatch, getState) => {
        dispatch(slice.actions.updateUser({ user }));
    };
};

export const UpdateAuthentication = ({ user, accessToken, refreshToken }) => {
    return (dispatch, getState) => {
        dispatch(slice.actions.updateAuthentication({ user, accessToken, refreshToken }));
    };
};

export function TokenReceived(payload) {
    return (dispatch, getState) => {
        dispatch(slice.actions.tokenReceived(payload));
    };
}

export function LogoutUser() {
    return (dispatch, getState) => {
        dispatch(revertAll());
    };
}

// export function NewPassword(formValues) {
//     return async (dispatch, getState) => {
//         dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//         await axios
//             .post(
//                 "/auth/reset-password",
//                 {
//                     ...formValues,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 },
//             )
//             .then(function (response) {
//                 console.log(response);
//                 dispatch(
//                     slice.actions.logIn({
//                         isLoggedIn: true,
//                         token: response.data.token,
//                     }),
//                 );
//                 dispatch(showSnackbar({ severity: "success", message: response.data.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
//             })
//             .catch(function (error) {
//                 console.log(error);
//                 dispatch(showSnackbar({ severity: "error", message: error.error.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
//             });
//     };
// }

// export function ForgotPassword(formValues) {
//     return async (dispatch, getState) => {
//         dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//         await axios
//             .post(
//                 "/auth/forgot-password",
//                 {
//                     ...formValues,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 },
//             )
//             .then(function (response) {
//                 console.log(response);

//                 dispatch(showSnackbar({ severity: "success", message: response.data.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
//             })
//             .catch(function (error) {
//                 console.log(error);
//                 dispatch(showSnackbar({ severity: "error", message: error.error.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
//             });
//     };
// }

// export function LoginUser(formValues) {
//     return async (dispatch, getState) => {
//         // Make API call here

//         dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//         await axios
//             .post('/auth/login', {
//                 ...formValues,
//             })
//             .then(function (response) {
//                 dispatch(
//                     slice.actions.logIn({
//                         isLoggedIn: true,
//                         token: response.data.metadata.tokens.accessToken,
//                         refreshToken: response.data.metadata.tokens.refreshToken,
//                         user_id: response.data.metadata.user._id,
//                         email: response.data.metadata.user.usr_email,
//                         user: response.data.metadata.user,
//                     }),
//                 );
//                 dispatch(SetUser(response.data.metadata.user));
//                 window.localStorage.setItem('user_id', response.data.metadata.user._id);
//                 dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
//             })
//             .catch(function (error) {
//                 console.log(error);
//                 dispatch(showSnackbar({ severity: 'error', message: error.error?.message || 'Try again later!' }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
//             });
//     };
// }

// export function handleRefreshToken({ accessToken, refreshToken }) {
//     return async (dispatch, getState) => {
//         dispatch(slice.actions.saveNewTokens({ accessToken, refreshToken }));
//     };
// }

// export function RegisterUser(formValues) {
//     return async (dispatch, getState) => {
//         dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//         await axios
//             .post('/auth/signup', {
//                 ...formValues,
//             })
//             .then(function (response) {
//                 // dispatch(slice.actions.updateRegisterEmail({ email: response.data.metadata.user.usr_email }));
//                 dispatch(
//                     slice.actions.logIn({
//                         isLoggedIn: true,
//                         token: response.data.metadata.tokens.accessToken,
//                         refreshToken: response.data.metadata.tokens.refreshToken,
//                         user_id: response.data.metadata.user._id,
//                         email: response.data.metadata.user.usr_email,
//                         user: response.data.metadata.user,
//                     }),
//                 );
//                 dispatch(SetUser(response.data.metadata.user));
//                 window.localStorage.setItem('user_id', response.data.metadata.user._id);
//                 dispatch(showSnackbar({ severity: 'success', message: response.data.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
//             })
//             .catch(function (error) {
//                 console.log(error);
//                 dispatch(showSnackbar({ severity: 'error', message: error.error?.message || 'Try again later!' }));
//                 dispatch(slice.actions.updateIsLoading({ error: true, isLoading: false }));
//             })
//             .finally(() => {
//                 // if (!getState().auth.error) {
//                 //     // window.location.href = '/auth/verify';
//                 //     window.location.href = '/app';
//                 // }
//             });
//     };
// }

// export function VerifyEmail(formValues) {
//     return async (dispatch, getState) => {
//         dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//         await axios
//             .post(
//                 "/auth/verify",
//                 {
//                     ...formValues,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 },
//             )
//             .then(function (response) {
//                 console.log(response);
//                 dispatch(slice.actions.updateRegisterEmail({ email: "" }));
//                 window.localStorage.setItem("user_id", response.data.user_id);
//                 dispatch(
//                     slice.actions.logIn({
//                         isLoggedIn: true,
//                         token: response.data.token,
//                     }),
//                 );

//                 dispatch(showSnackbar({ severity: "success", message: response.data.message }));
//                 dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
//             })
//             .catch(function (error) {
//                 console.log(error);
//                 dispatch(showSnackbar({ severity: "error", message: error.error.message }));
//                 dispatch(slice.actions.updateIsLoading({ error: true, isLoading: false }));
//             });
//     };
// }
