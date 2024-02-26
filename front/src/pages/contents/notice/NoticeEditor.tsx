import {useRef} from "react";
import BaseEditor from "component/baseEditor/BaseEditor";
import Grid from "@mui/material/Grid";

const NoticeEditor = () => {
    const editorRef = useRef(null);

    return (
        <Grid item md={true}>
            <BaseEditor ref={editorRef} />
        </Grid>
    );
};

export default NoticeEditor;
