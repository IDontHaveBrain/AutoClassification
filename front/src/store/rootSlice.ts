import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User, UserInfo} from "../model/GlobalModel";

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        access_token: '',
        refresh_token: '',
        user: {
            email: '',
            name: '',
        } as User,
    } as UserInfo,
    reducers: {
        setUserInfo: (state, action: PayloadAction<UserInfo>) => {
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.user = action.payload.user;
        },
        resetUserInfo: (state) => {
            state.access_token = '';
            state.refresh_token = '';
            state.user = {
                email: '',
                name: '',
            };
        },
    }
});

export const {setUserInfo} = userInfoSlice.actions;

export default userInfoSlice.reducer;