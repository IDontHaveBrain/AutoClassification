import { AxiosPromise } from "axios";
import { UserApi } from "../commons/ApiClient";
import { URLS } from "../../utils/constant";
import qs from "qs";

export const getMyWorkspaceList = (search?): AxiosPromise => {
  const queryString = qs.stringify(search);
  return UserApi.get(`${URLS.API.WORKSPACE.MYLIST}?${queryString}`);
  // return UserApi.get(URLS.API.WORKSPACE.MYLIST, { params: search });
};

export const createWorkspace = (data): AxiosPromise => {
  return UserApi.post(URLS.API.WORKSPACE.POST, data);
};

export const updateWorkspace = (id, data): AxiosPromise => {
  return UserApi.put(`${URLS.API.WORKSPACE.PUT}/${id}`, data);
};

export const deleteWorkspace = (id): AxiosPromise => {
  return UserApi.delete(`${URLS.API.WORKSPACE.DELETE}/${id}`);
};
