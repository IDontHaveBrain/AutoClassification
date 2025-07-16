import { type Middleware, type UnknownAction } from '@reduxjs/toolkit';

import { CONSTANT } from 'utils/constant';

import { resetUserInfo } from './rootSlice';

interface ErrorAction extends UnknownAction {
  error?: {
    response?: {
      status: number;
    };
  };
}

const errorMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const errorAction = action as ErrorAction;
  if (errorAction.error && errorAction.error?.response?.status === 401) {
    localStorage.setItem(CONSTANT.ACCESS_TOKEN, '');
    storeAPI.dispatch(resetUserInfo());
    window.location.href = '/sign-in';
  }
  return next(action);
};

export default errorMiddleware;
