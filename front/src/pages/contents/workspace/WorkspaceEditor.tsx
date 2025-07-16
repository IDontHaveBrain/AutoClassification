import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
Divider,     Grid, IconButton,     Paper, Snackbar,
Tab,
    Tabs, Tooltip, Typography } from '@mui/material';
import { type Member } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';

interface EditorHandle {
  getEditorState: () => { title: string; content: string };
}
import WorkspaceClass from 'pages/contents/workspace/editor/WorkspaceClass';
import WorkspaceDataSet from 'pages/contents/workspace/editor/WorkspaceDataSet';
import WorkspaceMember from 'pages/contents/workspace/editor/WorkspaceMember';
import { createWorkspace, updateWorkspace } from 'service/Apis/WorkspaceApi';

import BaseEditor from 'components/baseEditor/BaseEditor';
import MemberSearchModal from 'components/modal/MemberSearchModal';
import { onAlert } from 'utils/alert';

import WorkspaceDropZone from './editor/WorkspaceDropZone';

interface CustomFile extends File {
    preview: string;
}

const WorkspaceEditor = () => {
    const { t: tValidation } = useTranslation('validation');
    const { t: tWorkspace } = useTranslation('workspace');
    const { t: tCommon } = useTranslation('common');
    const [workspace, setWorkspace] = useState<WorkspaceModel>();
    const [newFiles, setNewFiles] = useState<CustomFile[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const editorRef = useRef<EditorHandle>(null);
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
            setError(tValidation('required'));
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
            if (isEdit && workspace) {
                await updateWorkspace(workspace.id, formData);
                onAlert(tWorkspace('messages.updateSuccess'));
            } else {
                await createWorkspace(formData);
                onAlert(tWorkspace('messages.createSuccess'));
            }
            navigate(-1);
        } catch (_err) {
            setError(isEdit ? tWorkspace('messages.updateFailed') : tWorkspace('messages.createFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = (member: Member) => {
        if (!member || !workspace) return;
        const newMembers = Array.isArray(workspace.members) ? [...workspace.members, member] : [member];
        setWorkspace({ ...workspace, members: newMembers });
    };

    const onClassesChange = (classes: string[]) => {
        if (!workspace) return;
        setWorkspace({ ...workspace, classes });
    };

    const removeMember = (member: Member) => {
        if (!workspace?.members) return;
        const newMembers = workspace.members.filter((m: Member) => m.id !== member.id);
        setWorkspace({ ...workspace, members: newMembers });
    };

    const handleFilesChange = (files: CustomFile[]) => {
        setNewFiles(files);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Grid container direction="column" spacing={3}>
                <Grid size="auto" container justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1">
                        {isEdit ? tWorkspace('editor.editTitle') : tWorkspace('editor.createTitle')}
                    </Typography>
                    <Box>
                        <Tooltip title={tCommon('save')}>
                            <IconButton color="primary" onClick={handleSave} disabled={isLoading}>
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={tCommon('close')}>
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
                            <Tab label={tWorkspace('editor.basicInfo')} />
                            <Tab label={tWorkspace('detail.classes')} />
                            <Tab label={tWorkspace('dataset.title')} />
                            <Tab label={tWorkspace('detail.members')} />
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
                                        defaultTitle={workspace?.name || ''}
                                        defaultContent={workspace?.description || ''}
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
                                {workspace ? (
                                    <>
                                        <WorkspaceMember
                                            workspace={workspace}
                                            removeMember={removeMember}
                                            isLoading={isLoading}
                                            error={error}
                                        />
                                        <Grid container justifyContent="center" sx={{ mt: 2 }}>
                                            <Button variant="contained" color="primary" onClick={() => setOpenMemberModal(true)}>
                                                {tWorkspace('members.addMember')}
                                            </Button>
                                        </Grid>
                                    </>
                                ) : (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                                        <Typography variant="body1" color="text.secondary">
                                            {tWorkspace('messages.workspaceRequired')}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </>
                    )}
                </Grid>
            </Grid>
            <Dialog open={openMemberModal} onClose={() => setOpenMemberModal(false)} closeAfterTransition={false}>
                <MemberSearchModal close={() => setOpenMemberModal(false)} setData={addMember} />
            </Dialog>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                closeAfterTransition={false}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{tCommon('confirm')} {tCommon('save')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {tWorkspace('messages.saveProgress')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                        {tCommon('cancel')}
                    </Button>
                    <Button onClick={confirmSave} color="primary">
                        {tCommon('confirm')}
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
