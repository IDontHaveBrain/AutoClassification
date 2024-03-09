import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react";

interface PageContextType<T> {
  pageState: T | null,
  setPageState: Dispatch<SetStateAction<T | null>>
}

export const PageContext = createContext<PageContextType<any> | null>(null);

export const PageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [pageState, setPageState] = useState<any>(null);

  return (
    <PageContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext<T>(): PageContextType<T> {
  const context = useContext<PageContextType<T> | null>(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used within a PageProvider");
  }
  return context;
}