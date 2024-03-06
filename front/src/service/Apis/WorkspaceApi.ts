import { AxiosPromise } from "axios";
import { UserApi } from "../commons/ApiClient";
import { URLS } from "../../utils/constant";
import qs from "qs";

export const getMyWorkspaceList = (search?): AxiosPromise => {
  const queryString = qs.stringify(search);
  return UserApi.get(`${URLS.API.WORKSPACE.MYLIST}?${queryString}`);
};
