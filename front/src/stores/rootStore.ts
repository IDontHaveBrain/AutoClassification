import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { persistReducer, persistStore } from 'redux-persist';
import sessionStorage from 'redux-persist/es/storage/session';

// Enable Immer MapSet plugin to handle Set/Map operations
enableMapSet();

import { initializeI18n, syncI18nWithStore } from '../i18n/init';
import SseManager from '../service/commons/SseManager';

import { i18nReducer, type I18nState } from './i18nSlice';
import errorMiddleware from './rootMiddleware';
import { alertReducer, sseReducer, userInfoReducer } from './rootSlice';

// Transform functions to handle Set serialization/deserialization
const i18nTransform = {
  in: (inboundState: unknown) => {
    if (inboundState && typeof inboundState === 'object' && inboundState !== null && 'cachedLanguages' in inboundState) {
      // Convert array back to Set during rehydration
      return {
        ...inboundState,
        cachedLanguages: new Set((inboundState as { cachedLanguages: unknown[] }).cachedLanguages),
      };
    }
    return inboundState;
  },
  out: (outboundState: I18nState) => {
    if (outboundState && outboundState.cachedLanguages) {
      // Convert Set to array for serialization
      return {
        ...outboundState,
        cachedLanguages: Array.from(outboundState.cachedLanguages),
      };
    }
    return outboundState;
  },
};

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['userInfo', 'i18n'],
  transforms: [
    {
      in: (inboundState: unknown) => {
        if (inboundState && typeof inboundState === 'object' && inboundState !== null && 'i18n' in inboundState) {
          return {
            ...inboundState,
            i18n: i18nTransform.in((inboundState as { i18n: unknown }).i18n),
          };
        }
        return inboundState;
      },
      out: (outboundState: unknown) => {
        if (outboundState && typeof outboundState === 'object' && outboundState !== null && 'i18n' in outboundState) {
          return {
            ...outboundState,
            i18n: i18nTransform.out((outboundState as { i18n: I18nState }).i18n),
          };
        }
        return outboundState;
      },
    },
  ],
};

const reducers = combineReducers({
  userInfo: userInfoReducer,
  alert: alertReducer,
  sse: sseReducer,
  i18n: i18nReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

const rootStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(errorMiddleware),
});

const persistor = persistStore(rootStore);

// SSE 연결 상태 변경 시 스토어 업데이트
SseManager.getInstance().onConnectionStatusChange((isConnected) => {
  rootStore.dispatch({ type: 'sse/setConnectionStatus', payload: isConnected });
});

// Initialize i18n with Redux store
initializeI18n(rootStore);
syncI18nWithStore(rootStore);

export { persistor,rootStore };

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
