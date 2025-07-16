import { type AlarmModel, type Member,type NoticeModel, type SseType, type WorkspaceModel } from 'model/GlobalModel';

interface SseDataMap {
    [SseType.HEARTBEAT]: { timestamp: number };
    [SseType.ALARM]: AlarmModel;
    [SseType.NOTICE]: NoticeModel;
    [SseType.WORKSPACE_UPDATE]: WorkspaceModel;
    [SseType.USER_UPDATE]: Member;
}

type SseData<T extends SseType> = T extends keyof SseDataMap ? SseDataMap[T] : unknown;

export const eventBus = {
    listeners: new Map<SseType, ((_data: unknown) => void)[]>(),
    subscribe<T extends SseType>(event: T, callback: (_data: SseData<T>) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback as (_data: unknown) => void);
    },
    unsubscribe<T extends SseType>(event: T, callback: (_data: SseData<T>) => void) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback as (_data: unknown) => void);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    },
    publish<T extends SseType>(event: T, data: SseData<T>) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.forEach((callback) => callback(data));
        }
    },
};