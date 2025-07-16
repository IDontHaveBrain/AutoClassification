import { type AxiosPromise } from 'axios';
import { UserApi } from 'service/commons/ApiClient';
import { type NoticeData,type SearchParams } from 'types';

import { URLS } from 'utils/constant';

export const getNoticeList = (search?: SearchParams): AxiosPromise => {
  return UserApi.get(URLS.API.NOTICE.GET, { params: search });
};

export const getNoticeDetail = (id: number): AxiosPromise => {
  return UserApi.get(`${URLS.API.NOTICE.GET  }/${id}`);
};

export const addNotice = (data: NoticeData): AxiosPromise => {
  return UserApi.post(URLS.API.NOTICE.POST, data);
};

export const updateNotice = (id: number, data: NoticeData): AxiosPromise => {
  return UserApi.put(`${URLS.API.NOTICE.PUT  }/${id}`, data);
};

export const deleteNotice = (id: number): AxiosPromise => {
  return UserApi.delete(`${URLS.API.NOTICE.DELETE  }/${id}`);
};
