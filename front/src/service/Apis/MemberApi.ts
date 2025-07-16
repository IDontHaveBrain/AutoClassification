import { type AxiosPromise } from 'axios';
import { type Member } from 'model/GlobalModel';
import { UserApi } from 'service/commons/ApiClient';
import { type SearchParams } from 'types';

import { URLS } from 'utils/constant';

export const getMemberList = (search: SearchParams): AxiosPromise => {
    return UserApi.get(URLS.API.MEMBER.SEARCH, { params: search });
};

export const getCurrentUser = (): AxiosPromise<Member> => {
    return UserApi.get(URLS.API.MEMBER.ME);
};