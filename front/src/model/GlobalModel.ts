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

export interface NoticeModel {
    id: number;
    title: string;
    content: string;
    createDateTime: string;
    updateDateTime: string;
}