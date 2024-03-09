import React, { useReducer, useRef, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import BaseEditor from "component/baseEditor/BaseEditor";
import { useLocation, useNavigate } from "react-router-dom";
import { createWorkspace, updateWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import { Workspace } from "model/WorkspaceModel";
import WorkspaceAccordion from "pages/contents/workspace/editor/WorkspaceAccordion";
import WorkspaceDropZone from './editor/WorkspaceDropZone';
import { usePageContext } from "component/PageContext";



const WorkspaceEditor = () => {
  const { pageState, setPageState } = usePageContext<{
    editorData: {
      title: string,
      content: string,
    },
    files: any[],
    classifyItems: any[],
    isEdit: boolean,
    workspace: Workspace | null,
  }>();
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.data) {
      const data = location.state["data"] as Workspace;
      setPageState({
        ...pageState,
        editorData: { title: data?.name, content: data?.description },
        files: data?.files || [],
        classifyItems: data?.classifyItems || [],
        isEdit: true,
        workspace: data,
      });
    } else {
      setPageState({
        ...pageState,
        isEdit: false,
      });
    }
  }, [location]);


  const handleSave = async () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    const formData = new FormData();
    formData.append("update", JSON.stringify({
      name: editorState.title,
      description: editorState.content,
    }));

    pageState.files.forEach((file, index) => {
      formData.append(`files`, file); // 'files[]' use when server supports array
    });

    try {
      if (pageState.isEdit) {
        const res = await updateWorkspace(pageState.workspace.id, formData);
        onAlert(Strings.Workspace.update);
        navigate(-1);
      } else {
        const res = await createWorkspace(formData);
        onAlert(Strings.Workspace.add);
        navigate(-1);
      }
    }
    catch (err) {
      console.log(err);
      onAlert(pageState.isEdit ? Strings.Workspace.updateFailed : Strings.Workspace.addFailed);
    }
  };

  return (
    <Grid container direction="column">
      <Grid item md={true}>
        <BaseEditor
          handleSave={handleSave}
          defaultValue={pageState.editorData}
          ref={editorRef}
        />
      </Grid>
      <WorkspaceAccordion />
      <WorkspaceDropZone />
    </Grid>
  );
};

export default WorkspaceEditor;