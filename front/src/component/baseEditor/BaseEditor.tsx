import {forwardRef, useState} from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {Divider} from "@mui/material";
import TextEditor from "component/baseEditor/TextEditor";

const BaseEditor = (ref) => {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');

    return (
        <Box>
            <TextField value={title} onChange={(e) => setTitle(e.target.value)}/>
            <Divider/>
            <TextEditor value={content} setValue={setContent}/>
        </Box>
    );
}

export default forwardRef(BaseEditor);