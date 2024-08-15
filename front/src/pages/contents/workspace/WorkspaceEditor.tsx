import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createWorkspace, updateWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import { WorkspaceModel } from "model/WorkspaceModel";
import { Member } from "model/GlobalModel";
import { 
    Grid, Dialog, Divider, Button, Box, CircularProgress, Snackbar, 
    Paper, Typography, IconButton, Tooltip, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tabs, Tab
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import BaseEditor from "component/baseEditor/BaseEditor";
import WorkspaceClass from "pages/contents/workspace/editor/WorkspaceClass";
import WorkspaceDropZone from "./editor/WorkspaceDropZone";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import WorkspaceMember from "pages/contents/workspace/editor/WorkspaceMember";
import MemberSearchModal from "component/modal/MemberSearchModal";

const WorkspaceEditor = () => {
    // ... (rest of the component code)
    const [workspace, setWorkspace] = useState<WorkspaceModel>();
    const [newFiles, setNewFiles] = useState<any>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const editorRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            const { data } = location.state;
            setWorkspace(data);
            setIsEdit(true);
        }
    }, [location]);

    const handleSave = async () => {
        if (!editorRef.current) return;
        const editorState = editorRef.current.getEditorState();

        if (!editorState.title.trim() || !editorState.content.trim()) {
            setError("Title and description are required.");
            return;
        }

        setOpenConfirmDialog(true);
    };

    const confirmSave = async () => {
        setOpenConfirmDialog(false);
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

        newFiles?.forEach((file) => {
            formData.append(`files`, file);
        });

        setIsLoading(true);
        setError(null);

        try {
            if (isEdit) {
                await updateWorkspace(workspace.id, formData);
                onAlert(Strings.Workspace.update);
            } else {
                await createWorkspace(formData);
                onAlert(Strings.Workspace.add);
            }
            navigate(-1);
        } catch (err) {
            console.error(err);
            setError(isEdit ? Strings.Workspace.updateFailed : Strings.Workspace.addFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = (member) => {
        if (!member) return;
        const newMembers = Array.isArray(workspace?.members) ? [...workspace.members, member] : [member];
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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Grid container direction="column" spacing={3}>
                <Grid item container justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1">
                        {isEdit ? 'Edit Workspace' : 'Create Workspace'}
                    </Typography>
                    <Box>
                        <Tooltip title="Save">
                            <IconButton color="primary" onClick={handleSave} disabled={isLoading}>
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close">
                            <IconButton color="secondary" onClick={() => navigate(-1)}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Grid>
                <Grid item container justifyContent="center">
                    <Box sx={{ width: '100%', maxWidth: 600 }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            variant="fullWidth"
                            sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '4px',
                                '& .MuiTab-root': {
                                    color: 'white',
                                    '&.Mui-selected': {
                                        color: 'white',
                                        fontWeight: 'bold',
                                    },
                                    '&:not(:last-child)': {
                                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'white',
                                },
                            }}
                        >
                            <Tab label="Details" />
                            <Tab label="Classes" />
                            <Tab label="Files" />
                            <Tab label="Members" />
                        </Tabs>
                    </Box>
                </Grid>
                <Grid item>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box hidden={tabValue !== 0}>
                                {(workspace || !isEdit) && (
                                    <BaseEditor
                                        handleSave={handleSave}
                                        defaultTitle={workspace?.name}
                                        defaultContent={workspace?.description}
                                        ref={editorRef}
                                    />
                                )}
                            </Box>
                            <Box hidden={tabValue !== 1}>
                                <WorkspaceClass 
                                    classes={workspace?.classes} 
                                    onClassesChange={onClassesChange}
                                    isLoading={isLoading}
                                    error={error}
                                />
                            </Box>
                            <Box hidden={tabValue !== 2}>
                                <WorkspaceDropZone onFilesChange={handleFilesChange} />
                                <Divider sx={{ my: 2 }} />
                                <WorkspaceDataSet
                                    imgs={workspace?.files || []}
                                    setState={setWorkspace}
                                    isLoading={isLoading}
                                    error={error}
                                    classes={workspace?.classes} 
                                />
                            </Box>
                            <Box hidden={tabValue !== 3}>
                                <WorkspaceMember 
                                    workspace={workspace} 
                                    removeMember={removeMember}
                                    isLoading={isLoading}
                                    error={error}
                                />
                                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                                    <Button variant="contained" color="primary" onClick={() => setOpenMemberModal(true)}>
                                        Add Member
                                    </Button>
                                </Grid>
                            </Box>
                        </>
                    )}
                </Grid>
            </Grid>
            <Dialog open={openMemberModal} onClose={() => setOpenMemberModal(false)}>
                <MemberSearchModal close={() => setOpenMemberModal(false)} setData={addMember} />
            </Dialog>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Save"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to save these changes?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmSave} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={() => setError(null)}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Paper>
    );
};

export default WorkspaceEditor;
