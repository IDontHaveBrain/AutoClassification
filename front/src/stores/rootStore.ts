import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { alertReducer, sseReducer, userInfoReducer } from "./rootSlice";
import sessionStorage from "redux-persist/es/storage/session";
import errorMiddleware from "./rootMiddleware";

const persistConfig = {
  key: "root",
  storage: sessionStorage,
  whitelist: ["userInfo"],
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

export { rootStore, persistor };


export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
