import { AxiosPromise } from "axios";
import { UserApi } from "../commons/ApiClient";
import { URLS } from "../../utils/constant";

export const getMyWorkspaceList = (search?): AxiosPromise => {
  return UserApi.get(URLS.API.WORKSPACE.MYLIST);
};
