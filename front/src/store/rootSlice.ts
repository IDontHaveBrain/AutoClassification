import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AlertDetail, User, UserInfo} from "../model/GlobalModel";
import SseClient from "../service/SseClient";

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

const alertSlice = createSlice({
    name: 'alert',
    initialState: {
        message: '',
        open: false,
        callback: null,
    },
    reducers: {
        openAlert: (state, action: PayloadAction<AlertDetail>) => {
            state.message = action.payload.message;
            state.open = true;
            state.callback = action.payload?.callback;
        },
        closeAlert: (state) => {
            state.message = '';
            state.open = false;
            state.callback = null;
        },
    }
});

const sseSlice = createSlice({
    name: 'sse',
    initialState: {
        sseClient: SseClient.getInstance(),
    },
    reducers: {
        resetSseClient: (state) => {
            state.sseClient.disconnect();
            state.sseClient = null;
        }
    }
});

export const {resetSseClient} = sseSlice.actions;
export const sseReducer = sseSlice.reducer;

export const {setUserInfo, resetUserInfo} = userInfoSlice.actions;
export const {openAlert, closeAlert} = alertSlice.actions;

export const userInfoReducer = userInfoSlice.reducer;
export const alertReducer = alertSlice.reducer;