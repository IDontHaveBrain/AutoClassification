import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

interface EditorState {
  title: string;
  content: string;
}

interface EditorContextType {
  editor: EditorState;
  setEditor: Dispatch<SetStateAction<EditorState>>;
}

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within a EditorProvider");
  }
  return context;
};

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider = ({ children }: EditorProviderProps) => {
  const [editor, setEditor] = useState<EditorState>({ title: "", content: "" });

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
};
