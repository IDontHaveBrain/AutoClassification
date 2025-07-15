import { type AxiosPromise } from 'axios';

import { URLS } from '../../utils/constant';
import { UserApi } from '../commons/ApiClient';

export const getMyWorkspaceList = (search?): AxiosPromise => {
  return UserApi.get(URLS.API.WORKSPACE.MYLIST, { params: search });
};

export const createWorkspace = (data): AxiosPromise => {
  return UserApi.post(URLS.API.WORKSPACE.POST, data);
};

export const getWorkspace = (id): AxiosPromise => {
  return UserApi.get(`${URLS.API.WORKSPACE.GET}/${id}`);
};

export const updateWorkspace = (id, data): AxiosPromise => {
  return UserApi.put(`${URLS.API.WORKSPACE.PUT}/${id}`, data);
};

export const deleteWorkspace = (id): AxiosPromise => {
  return UserApi.delete(`${URLS.API.WORKSPACE.DELETE}/${id}`);
};
