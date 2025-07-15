import { createContext } from 'react';

export type ContextType<T = unknown> = {
    state: T;
    setState: React.Dispatch<React.SetStateAction<T>> | null;
    resetState: () => void;
};

const createContextState = <T = unknown>() => {
    const context = createContext<ContextType<T> | null>(null);

    return [context, context.Provider] as const;
};

export const [PageContext, PageProvider] = createContextState();
export const [NoticeContext, NoticeProvider] = createContextState();
export const [WorkspaceContext, WorkspaceProvider] = createContextState();