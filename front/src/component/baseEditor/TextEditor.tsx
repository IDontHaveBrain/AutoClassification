import {useEffect, useState} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface TextEditorProps {
    value?: string;
    onChange: (content: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
    const [editorContent, setEditorContent] = useState(value);

    useEffect(() => {
        setEditorContent(value);
    }, [value]);

    const handleChange = (value: string) => {
        setEditorContent(value);
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <>
            <ReactQuill
                theme={"snow"}
                value={editorContent}
                defaultValue={value}
                onChange={handleChange}
            />
        </>
    );
};

export default TextEditor;
