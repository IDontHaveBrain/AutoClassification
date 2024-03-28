import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import BaseEditor from "component/baseEditor/BaseEditor";
import { useLocation, useNavigate } from "react-router-dom";
import { createWorkspace, updateWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import { WorkspaceModel } from "model/WorkspaceModel";
import WorkspaceClass from "pages/contents/workspace/editor/WorkspaceClass";
import WorkspaceDropZone from "./editor/WorkspaceDropZone";
import { Dialog, Divider } from "@mui/material";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import WorkspaceMember from "pages/contents/workspace/editor/WorkspaceMember";
import Button from "@mui/material/Button";
import MemberSearchModal from "component/modal/MemberSearchModal";
import { Member } from "model/GlobalModel";

const WorkspaceEditor = () => {
    const [workspace, setWorkspace] = useState<WorkspaceModel>();
    const [newFiles, setNewFiles] = useState<any>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log(location);
        if (location.state) {
            const { data } = location.state;
            setWorkspace(data);
            setIsEdit(true);
        }
    }, [location]);

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
                        classes: workspace?.classes,
                        members: workspace?.members,
                    }),
                ],
                { type: "application/json" },
            ),
        );

        newFiles?.forEach((file, index) => {
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

    const addMember = (member) => {
        if (!member) {
            return;
        }

        const newMembers = Array.isArray(workspace?.members)
            ? [...workspace.members, member]
            : [member];

        setWorkspace({...workspace, members: newMembers});
    }

    const onClassesChange = (classes) => {
        setWorkspace({...workspace, classes});
    }

    const removeMember = (member) => {
        const newMembers = workspace?.members.filter((m: Member) => m.id !== member.id);
        setWorkspace({...workspace, members: newMembers});
    }

    const handleFilesChange = (files) => {
        setNewFiles(files);
    };

    return (
        <Grid container direction="column">
            <Grid item md={true}>
                {(workspace || !isEdit) && (
                    <BaseEditor
                        handleSave={handleSave}
                        defaultTitle={workspace?.name}
                        defaultContent={workspace?.description}
                        ref={editorRef}
                    />
                )}
            </Grid>
            <WorkspaceClass classes={workspace?.classes} onClassesChange={onClassesChange} />
            <WorkspaceDropZone onFilesChange={handleFilesChange} />
            <Divider sx={{ m: 2 }} />
            {workspace?.files?.length > 0 && (
                <WorkspaceDataSet imgs={workspace?.files} setState={setWorkspace} />
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