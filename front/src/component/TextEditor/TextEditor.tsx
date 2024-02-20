import {useState} from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import Box from "@mui/material/Box";

interface TextEditorProps {
    value: string;
    setValue: any;
}

const TextEditor = ({ value, setValue }: TextEditorProps) => {

    return (
        <Box>
            <ReactQuill theme={"snow"} value={value} onChange={setValue}/>
        </Box>
    )
}

export default TextEditor;