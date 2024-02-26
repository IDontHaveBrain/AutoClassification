import {useContext, useState} from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import {EditorContext} from "component/baseEditor/EditorContext";

interface TextEditorProps {
}

const TextEditor = (props: TextEditorProps) => {
    const { editor, setEditor } = useContext(EditorContext);

    const onChange = (value: string) => {
        setEditor(prevEditor => ({ ...prevEditor, content: value }));
    };

    return (
        <>
            <ReactQuill theme={"snow"} value={editor.content} onChange={onChange} style={{height: '25vh'}}/>
        </>
    )
}

export default TextEditor;