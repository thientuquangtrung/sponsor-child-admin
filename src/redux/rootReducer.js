import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { encryptTransform } from 'redux-persist-transform-encrypt';

// slices
import appReducer from './app/appReducer';
import authReducer from './auth/authReducer';
import baseApi from './baseApi';

// ----------------------------------------------------------------------

const rootPersistConfig = {
    key: 'sponsorchild-admin',
    storage,
    stateReconciler: autoMergeLevel2,
    keyPrefix: 'redux-',
    transforms: [
        encryptTransform({
            secretKey: 'my-super-secret-key',
            onError: function (error) {
                // Handle the error.
                console.error(error);
            },
        }),
    ],
    whitelist: ['auth'],
    // blacklist: ['conversation'],
};

const rootReducer = combineReducers({
    [baseApi.reducerPath]: baseApi.reducer,
    app: appReducer,
    auth: authReducer,
});

const rootMiddleware = (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
    }).concat(baseApi.middleware);

export { rootPersistConfig, rootReducer, rootMiddleware };
