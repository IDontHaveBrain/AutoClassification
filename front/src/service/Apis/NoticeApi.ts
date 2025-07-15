import { type AxiosPromise } from 'axios';
import { UserApi } from 'service/commons/ApiClient';

import { URLS } from 'utils/constant';

export const getNoticeList = (search?): AxiosPromise => {
  return UserApi.get(URLS.API.NOTICE.GET, { params: search });
};

export const getNoticeDetail = (id: number): AxiosPromise => {
  return UserApi.get(`${URLS.API.NOTICE.GET  }/${id}`);
};

export const addNotice = (data): AxiosPromise => {
  return UserApi.post(URLS.API.NOTICE.POST, data);
};

export const updateNotice = (id: number, data): AxiosPromise => {
  return UserApi.put(`${URLS.API.NOTICE.PUT  }/${id}`, data);
};

export const deleteNotice = (id: number): AxiosPromise => {
  return UserApi.delete(`${URLS.API.NOTICE.DELETE  }/${id}`);
};
