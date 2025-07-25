import { type WorkspaceModel } from './WorkspaceModel';

export { type WorkspaceModel };

export interface AlarmModel {
    id: number;
    title: string;
    content: string;
    link: string;
    createDateTime: string;
}

export interface AlertDetail {
    message: string;
    open?: boolean;
    callback?: () => void;
}

export interface GroupPermission {
    id: number;
    url: string;
    httpMethod?: string | null;
    description?: string | null;
}

export interface GroupPermissionMapping {
    id: number;
    memberGroup: MemberGroup;
    groupPermission: GroupPermission;
}

export interface MemberGroup {
    id: number;
    groupName: string;
    groupDescription?: string | null;
    members?: Member[];
    groupPermissionMappings?: GroupPermissionMapping[];
}

export interface Member {
    id?: number;
    email: string;
    name: string;
    memberGroup?: MemberGroup | null;
    workspace?: WorkspaceModel | null;
}

export interface MemberInfo {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: Member;
}

export enum SseType {
    HEARTBEAT = 'HEARTBEAT',
    ALARM = 'ALARM',
    NOTICE = 'NOTICE',
    WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
    USER_UPDATE = 'USER_UPDATE',
}

export interface SseEvent {
    id: string;
    type: SseType;
    data: string;
    timestamp: number;
}

export interface BaseDto {
    createMember?: string;
    updateMember?: string;
    createDateTime?: string;
    updateDateTime?: string;
}

export interface NoticeModel extends BaseDto {
    id: number;
    title: string;
    content: string;
}

export interface Page<T> {
    content: T[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface Pageable {
    page: number;
    size: number;
    sort?: string | string[];
}

export const initPageable = (size: number): Pageable => {
    return {
        page: 0,
        size: size,
        sort: 'id,desc',
    };
};

export interface FileModel extends BaseDto {
    id: number;
    url: string;
    fileName: string;
    originalFileName: string;
    size: number;
    label?: string;
}
