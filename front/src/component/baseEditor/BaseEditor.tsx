import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import { Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import BaseInputField from "component/BaseInputField";
import Button from "@mui/material/Button";
import TextEditor from "component/baseEditor/TextEditor";

interface Props {
    handleSave: () => void;
    defaultTitle: string;
    defaultContent: string;
}

const BaseEditor = ({ handleSave, defaultTitle, defaultContent }: Props, ref) => {
    const [editorTitle, setEditorTitle] = useState(defaultTitle);
    const [editorContent, setEditorContent] = useState(defaultContent);

    useEffect(() => {
        setEditorTitle(defaultTitle);
        setEditorContent(defaultContent);
    }, [defaultTitle, defaultContent]);

    useImperativeHandle(ref, () => ({
        getEditorState: () => ({ title: editorTitle, content: editorContent}),
    }));

    return (
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs>
                <BaseInputField label="Title : " value={editorTitle} onChange={(e) => setEditorTitle(e.target.value)} />
            </Grid>
            <Grid item>
                <Button
                    variant="contained"
                    color="success"
                    size={"small"}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </Grid>
            <Divider />
            <Grid item xs={12} style={{ paddingTop: "20px" }}>
                <TextEditor value={editorContent} onChange={setEditorContent} />
            </Grid>
        </Grid>
    );
};

export default forwardRef(BaseEditor);