import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { Divider, InputLabel } from "@mui/material";
import TextEditor from "component/baseEditor/TextEditor";
import Grid from "@mui/material/Grid";
import BaseInputField from "component/BaseInputField";
import { Strings } from "utils/strings";
import {
    EditorContext,
    EditorProvider,
} from "component/baseEditor/EditorContext";
import Button from "@mui/material/Button";

const BaseEditor = (props, ref) => {
    const [editor, setEditor] = useState({ title: "", content: "" });

    useImperativeHandle(ref, () => editor);

    return (
        <EditorContext.Provider value={{ editor, setEditor }}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <BaseInputField label={Strings.title + ":"} />
                </Grid>
                <Divider />
                <Grid item xs={12}>
                    <TextEditor />
                </Grid>
            </Grid>
        </EditorContext.Provider>
    );
};

export default forwardRef(BaseEditor);
