import {configureStore} from "@reduxjs/toolkit";
import {alertReducer, userInfoReducer} from "./rootSlice";

const rootStore = configureStore({
    reducer: {
        userInfo: userInfoReducer,
        alert: alertReducer,
    }
})

export default rootStore;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootStore.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof rootStore.dispatch