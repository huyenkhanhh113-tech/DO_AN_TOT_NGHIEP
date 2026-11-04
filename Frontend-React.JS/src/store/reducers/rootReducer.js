import {combineReducers} from 'redux';
import { connectRouter } from 'connected-react-router';
import appReducer from "./appReducer";
import userReducer from "./userReducer";
import adminReducer from './adminReducer';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

const persistCommonConfig = {
    storage: storage,
    stateReconciler: autoMergeLevel2,
};

const userPersistConfig = {
    ...persistCommonConfig,
    key: 'user',
    whitelist: ['isLoggedIn', 'userInfo']
};

const appPersistConfig = {
    ...persistCommonConfig,
    key: 'app',
};

const createRootReducer = (history) => combineReducers({
    router: connectRouter(history),
    admin: adminReducer,
    user: persistReducer(userPersistConfig, userReducer),
    app: persistReducer(appPersistConfig, appReducer)
})

export default createRootReducer;