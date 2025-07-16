import { type AxiosPromise } from 'axios';
import { type SearchParams, type WorkspaceUploadData } from 'types';

import { URLS } from '../../utils/constant';
import { UserApi } from '../commons/ApiClient';

export const getMyWorkspaceList = (search?: SearchParams): AxiosPromise => {
  return UserApi.get(URLS.API.WORKSPACE.MYLIST, { params: search });
};

export const createWorkspace = (data: WorkspaceUploadData): AxiosPromise => {
  return UserApi.post(URLS.API.WORKSPACE.POST, data);
};

export const getWorkspace = (id: number | string): AxiosPromise => {
  return UserApi.get(`${URLS.API.WORKSPACE.GET}/${id}`);
};

export const updateWorkspace = (id: number | string, data: WorkspaceUploadData): AxiosPromise => {
  return UserApi.put(`${URLS.API.WORKSPACE.PUT}/${id}`, data);
};

export const deleteWorkspace = (id: number | string): AxiosPromise => {
  return UserApi.delete(`${URLS.API.WORKSPACE.DELETE}/${id}`);
};
