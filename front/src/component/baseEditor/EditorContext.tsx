import {createContext, ReactNode, useState} from "react";

interface EditorState {
    title: string;
    content: string;
}

interface EditorContextType {
    editor: EditorState;
    setEditor: React.Dispatch<React.SetStateAction<EditorState>>;
}

export const EditorContext = createContext<EditorContextType | undefined>(undefined);

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