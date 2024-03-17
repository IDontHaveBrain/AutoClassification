import React, { useContext, useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import BaseEditor from "component/baseEditor/BaseEditor";
import { useLocation, useNavigate } from "react-router-dom";
import { createWorkspace, updateWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import { WorkspaceModel } from "model/WorkspaceModel";
import WorkspaceClass from "pages/contents/workspace/editor/WorkspaceClass";
import WorkspaceDropZone from "./editor/WorkspaceDropZone";
import { WorkspaceContext } from "utils/ContextManager";
import {Dialog, Divider} from "@mui/material";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import WorkspaceMember from "pages/contents/workspace/editor/WorkspaceMember";
import Button from "@mui/material/Button";
import MemberSearchModal from "component/modal/MemberSearchModal";
import {Member} from "model/GlobalModel";
import Modal from "@mui/material/Modal";

const WorkspaceEditor = () => {
    const { state, setState } = useContext(WorkspaceContext);
    const [workspace, setWorkspace] = useState<WorkspaceModel>();
    const [isEdit, setIsEdit] = useState(false);
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            const { data } = location.state;
            setWorkspace(data);
            setIsEdit(true);
            setState({...data, newFiles: [], members: data.members || []});
        }
    }, [location, setState]);

    const handleSave = async () => {
        if (!editorRef.current) return;
        const editorState = editorRef.current.getEditorState();

        const formData = new FormData();
        formData.append(
            "update",
            new Blob(
                [
                    JSON.stringify({
                        name: editorState.title,
                        description: editorState.content,
                        classes: state?.classes,
                        members: state?.members,
                    }),
                ],
                { type: "application/json" },
            ),
        );

        state?.newFiles?.forEach((file, index) => {
            formData.append(`files`, file);
        });

        try {
            if (isEdit) {
                const res = await updateWorkspace(workspace.id, formData);
                onAlert(Strings.Workspace.update);
                navigate(-1);
            } else {
                const res = await createWorkspace(formData);
                onAlert(Strings.Workspace.add);
                navigate(-1);
            }
        } catch (err) {
            console.log(err);
            onAlert(
                isEdit
                    ? Strings.Workspace.updateFailed
                    : Strings.Workspace.addFailed,
            );
        }
    };

    const dataToBase = () => {
        const baseData = {
            title: workspace?.name,
            content: workspace?.description,
        };

        return baseData;
    };

    const addMember = (member) => {
        if (!member) {
            return;
        }

        const newMembers = Array.isArray(state.members)
            ? [...state.members, member]
            : [member];

        setState({...state, members: newMembers});
        setWorkspace({...workspace, members: newMembers});
    }

    const removeMember = (member) => {
        const newMembers = state.members.filter((m: Member) => m.id !== member.id);
        setState({...state, members: newMembers});
        setWorkspace({...workspace, members: newMembers});
    }

    return (
        <Grid container direction="column">
            <Grid item md={true}>
                <BaseEditor
                    handleSave={handleSave}
                    defaultValue={dataToBase()}
                    ref={editorRef}
                />
            </Grid>
            <WorkspaceClass state={state} setState={setState} />
            <WorkspaceDropZone />
            <Divider sx={{ m: 2 }} />
            {workspace?.files?.length > 0 && (
                <WorkspaceDataSet imgs={workspace?.files} setState={setState} />
            )}
            <WorkspaceMember workspace={workspace} removeMember={removeMember} />
            <Grid item container justifyContent="center">
                <Button variant="contained" color="primary" sx={{ width: '150px' }}
                        onClick={() => setOpenMemberModal(true)}>
                    맴버 추가
                </Button>
            </Grid>
            <Dialog open={openMemberModal} onClose={() => setOpenMemberModal(false)}>
                <MemberSearchModal close={() => setOpenMemberModal(false)} setData={addMember} />
            </Dialog>
        </Grid>
    );
};

export default WorkspaceEditor;
