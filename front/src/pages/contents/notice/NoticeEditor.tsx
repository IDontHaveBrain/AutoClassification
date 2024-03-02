import {useRef} from "react";
import BaseEditor from "component/baseEditor/BaseEditor";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {addNotice} from "service/Apis/NoticeApi";

const NoticeEditor = () => {
    const editorRef = useRef(null);

    const handleSave = () => {
        if (!editorRef.current) return;

        const editorState = editorRef.current.getEditorState();
        console.log('RST !! = ', editorState);

        addNotice(editorState);
    };

    return (
        <Grid item md={true}>
            <BaseEditor handleSave={handleSave} ref={editorRef} />
        </Grid>
    );
};

export default NoticeEditor;
