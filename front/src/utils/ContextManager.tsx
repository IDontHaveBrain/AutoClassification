import { createContext, useState, FunctionComponent, ReactNode } from "react";

type ContextType = {
    state: any;
    setState: React.Dispatch<React.SetStateAction<any>> | null;
    resetState: () => void;
};

const createContextState = () => {
    const context = createContext<ContextType | null>(null);

    return [context, context.Provider] as const;
};

export const [PageContext, PageProvider] = createContextState();
export const [NoticeContext, NoticeProvider] = createContextState();
export const [WorkspaceContext, WorkspaceProvider] = createContextState();