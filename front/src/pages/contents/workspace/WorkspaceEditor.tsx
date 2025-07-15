import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
Divider,     Grid, IconButton,     Paper, Snackbar,
Tab,
    Tabs, Tooltip, Typography } from '@mui/material';
import BaseEditor from 'component/baseEditor/BaseEditor';
import MemberSearchModal from 'component/modal/MemberSearchModal';
import { type Member } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import WorkspaceClass from 'pages/contents/workspace/editor/WorkspaceClass';
import WorkspaceDataSet from 'pages/contents/workspace/editor/WorkspaceDataSet';
import WorkspaceMember from 'pages/contents/workspace/editor/WorkspaceMember';
import { createWorkspace, updateWorkspace } from 'service/Apis/WorkspaceApi';

import { onAlert } from 'utils/alert';
import { Strings } from 'utils/strings';

import WorkspaceDropZone from './editor/WorkspaceDropZone';

interface CustomFile extends File {
    preview: string;
}

const WorkspaceEditor = () => {
    const [workspace, setWorkspace] = useState<WorkspaceModel>();
    const [newFiles, setNewFiles] = useState<CustomFile[]>([]);
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

    const handleSave = () => {
        if (!editorRef.current) return;
        const editorState = editorRef.current.getEditorState();

        if (!editorState.title.trim() || !editorState.content.trim()) {
            setError('Title and description are required.');
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
            'update',
            new Blob(
                [
                    JSON.stringify({
                        name: editorState.title,
                        description: editorState.content,
                        classes: workspace?.classes,
                        memberIds: workspace?.members?.map(member => member.id),
                    }),
                ],
                { type: 'application/json' },
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
        } catch (_err) {
            setError(isEdit ? Strings.Workspace.updateFailed : Strings.Workspace.addFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = (member) => {
        if (!member) return;
        const newMembers = Array.isArray(workspace?.members) ? [...workspace.members, member] : [member];
        setWorkspace({ ...workspace, members: newMembers });
    };

    const onClassesChange = (classes) => {
        setWorkspace({ ...workspace, classes });
    };

    const removeMember = (member) => {
        const newMembers = workspace?.members.filter((m: Member) => m.id !== member.id);
        setWorkspace({ ...workspace, members: newMembers });
    };

    const handleFilesChange = (files) => {
        setNewFiles(files);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Grid container direction="column" spacing={3}>
                <Grid size="auto" container justifyContent="space-between" alignItems="center">
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
                <Grid size="auto" container justifyContent="center">
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
                <Grid size="auto">
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
                <DialogTitle id="alert-dialog-title">{'Confirm Save'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to save these changes?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmSave} color="primary">
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
