import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import sessionStorage from 'redux-persist/es/storage/session';

import SseManager from '../service/commons/SseManager';

import errorMiddleware from './rootMiddleware';
import { alertReducer, sseReducer, userInfoReducer } from './rootSlice';

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['userInfo'],
};

const reducers = combineReducers({
  userInfo: userInfoReducer,
  alert: alertReducer,
  sse: sseReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

const rootStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(errorMiddleware),
});

const persistor = persistStore(rootStore);

SseManager.getInstance().onConnectionStatusChange((isConnected) => {
  rootStore.dispatch({ type: 'sse/setConnectionStatus', payload: isConnected });
});

export { persistor,rootStore };

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
