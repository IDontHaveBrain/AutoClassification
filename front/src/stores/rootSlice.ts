import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  type AlarmModel,
  type AlertDetail,
  type Member,
  type MemberInfo,
} from '../model/GlobalModel';

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: {
    access_token: '',
    refresh_token: '',
    user: {
      email: '',
      name: '',
    } as Member,
  } as MemberInfo,
  reducers: {
    setUserInfo: (state, action: PayloadAction<MemberInfo>) => {
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
  },
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
  },
});

const sseSlice = createSlice({
  name: 'sse',
  initialState: {
    sseEvents: [] as AlarmModel[],
  },
  reducers: {
    newSseEvent: (state, action: PayloadAction<AlarmModel>) => {
      state.sseEvents.push(action.payload);
    },
  },
});

export const { newSseEvent } = sseSlice.actions;
export const sseReducer = sseSlice.reducer;

export const { setUserInfo, resetUserInfo } = userInfoSlice.actions;
export const { openAlert, closeAlert } = alertSlice.actions;

export const userInfoReducer = userInfoSlice.reducer;
export const alertReducer = alertSlice.reducer;
