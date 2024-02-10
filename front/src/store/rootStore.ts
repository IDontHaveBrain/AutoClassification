import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import {alertReducer, userInfoReducer} from "./rootSlice";
import sessionStorage from "redux-persist/es/storage/session";
import errorMiddleware from "./rootMiddleware";

const persistConfig = {
    key: 'root',
    storage: sessionStorage,
    whitelist: ['userInfo'],
}

const reducers = combineReducers({
    userInfo: userInfoReducer,
    alert: alertReducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)

const rootStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
            .concat(errorMiddleware),
})

const persistor = persistStore(rootStore)

export { rootStore, persistor }

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootStore.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof rootStore.dispatch