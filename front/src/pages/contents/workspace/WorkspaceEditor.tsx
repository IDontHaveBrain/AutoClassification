import Grid from "@mui/material/Grid";
import BaseEditor from "component/baseEditor/BaseEditor";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createWorkspace, updateWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

const WorkspaceEditor = () => {
  const [workspace, setWorkspace] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.data) {
      setIsEdit(true);
      setWorkspace(location.state["data"]);
    }
  }, [location]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    if (isEdit) {
      updateWorkspace(workspace.id, editorState)
        .then((res) => {
          onAlert(Strings.Workspace.update);
          navigate(-1);
        })
        .catch((err) => {
          console.log(err);
          onAlert(Strings.Workspace.updateFailed);
        });
    } else {
      createWorkspace(editorState)
        .then((res) => {
          onAlert(Strings.Workspace.add);
          navigate(-1);
        })
        .catch((err) => {
          console.log(err);
          onAlert(Strings.Workspace.addFailed);
        });
    }
  };

  return (
    <Grid item md={true}>
      <BaseEditor
        handleSave={handleSave}
        defaultValue={workspace}
        ref={editorRef}
      />
    </Grid>
  );
};
export default WorkspaceEditor;
