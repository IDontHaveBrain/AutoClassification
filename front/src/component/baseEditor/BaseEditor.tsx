import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react";
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

interface Props {
    handleSave: () => void;
    defaultValue?: any;
}

const BaseEditor = ({ handleSave, defaultValue }: Props, ref) => {
  const [editor, setEditor] = useState();

  useEffect(() => {
    if (defaultValue) {
      setEditor(defaultValue);
    }
  }, [defaultValue]);

  useImperativeHandle(ref, () => ({
    getEditorState: () => editor,
  }));

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs>
          <BaseInputField label="Title : " value={defaultValue.title} />
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
          <TextEditor value={defaultValue.content} />
        </Grid>
      </Grid>
    </EditorContext.Provider>
  );
};

export default forwardRef(BaseEditor);
