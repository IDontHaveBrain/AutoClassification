export interface AlarmModel {
    id: number;
    title: string;
    content: string;
    createDateTime: string;
}

export interface AlertDetail {
    message: string;
    open?: boolean;
    callback?: () => any;
}

export interface User {
    id?: number;
    email: string;
    name: string;
}

export interface UserInfo {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
}

export enum SseType {
    HEARTBEAT = 'HEARTBEAT',
    ALARM = 'ALARM',
    NOTICE = 'NOTICE',
    MESSAGE = 'MESSAGE',
}

export interface SseEvent {
    id: string;
    type: SseType;
    message: string;
}

export interface BaseDto {
    createMember?: string;
    updateMember?: string;
    createDateTime?: string;
    updateDateTime?: string;

}

export interface NoticeModel extends BaseDto{
    id: number;
    title: string;
    content: string;
}

export interface Pageable {
    page: number;
    pageSize: number;
    sort?: any;
}

export const initPageable = (size: number): Pageable => {
    return {
        page: 0,
        pageSize: size,
        sort: "id,desc",
    }
}

export interface FileModel {
    id: number;
    url: string;
    fileName: string;
    originalFileName: string;
    size: number;
    createMember: string;
    updateMember: string;
    createDateTime: string;
    updateDateTime: string;
}