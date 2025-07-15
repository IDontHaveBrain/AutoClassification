import React, { useCallback,useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    ImageList,
    ImageListItem,
    Modal,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { useTranslation } from 'hooks/useTranslation';
import { SseType } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import { deleteWorkspace, getWorkspace } from 'service/Apis/WorkspaceApi';

import { onAlert } from 'utils/alert';
import { eventBus } from 'utils/eventBus';

interface Props {
    data: WorkspaceModel;
    handleClose: () => void;
    onDeleteSuccess: () => void;
}

const WorkspaceDetail: React.FC<Props> = ({ data, handleClose, onDeleteSuccess }) => {
    const { t: commonT } = useTranslation('common');
    const { t: workspaceT } = useTranslation('workspace');

    const [detail, setDetail] = useState<WorkspaceModel | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>(workspaceT('detail.all'));
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    const filteredFiles = () => {
        if (!detail.files) return [];
        if (selectedTab === workspaceT('detail.all')) {
            return detail.files;
        } else if (selectedTab === workspaceT('detail.none')) {
            return detail.files.filter(file => !file.label || file.label.toLowerCase() === 'none');
        } else if (detail.classes?.includes(selectedTab)) {
            return detail.files.filter(file => file.label === selectedTab);
        }
        return [];
    };
    const navigate = useNavigate();

    const fetchWorkspaceDetail = useCallback(async (id: number) => {
        try {
            const res = await getWorkspace(id);
            setDetail(res.data);
        } catch (_err) {
            onAlert(commonT('messages.apiFailed'));
        }
    }, [commonT]);

    useEffect(() => {
        if (data && data.id) {
            fetchWorkspaceDetail(data.id);

            const handleSseMessage = (updatedWorkspace: WorkspaceModel) => {
                if (updatedWorkspace.id === data.id) {
                    fetchWorkspaceDetail(data.id);
                }
            };

            eventBus.subscribe(SseType.WORKSPACE_UPDATE, handleSseMessage);

            return () => {
                eventBus.unsubscribe(SseType.WORKSPACE_UPDATE, handleSseMessage);
            };
        }
    }, [data, fetchWorkspaceDetail]);

    const handleEdit = () => {
        navigate('/workspace/editor', { state: { data: detail } });
    };

    const handleDelete = () => {
        setOpenConfirmDialog(true);
    };

    const confirmDelete = () => {
        setOpenConfirmDialog(false);
        if (detail) {
            deleteWorkspace(detail.id.toString())
                .then(() => {
                    handleClose();
                    onDeleteSuccess();
                    // Publish event to trigger workspace updates
                    eventBus.publish(SseType.WORKSPACE_UPDATE, detail);
                    onAlert(commonT('messages.apiSuccess'));
                })
                .catch((_err) => {
                    onAlert(commonT('messages.apiFailed'));
                });
        }
    };

    if (!detail) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <DialogContent>
                <Box mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {detail.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {workspaceT('members.owner')}: {detail.owner.name} ({detail.owner.email})
                    </Typography>
                </Box>

                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {workspaceT('detail.description')}
                    </Typography>
                    <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{
                            __html: detail.description || workspaceT('detail.noDescription'),
                        }}
                    />
                </Paper>

                {detail.classes && detail.classes.length > 0 && (
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {workspaceT('classification.classTitle')}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {detail.classes.map((cls) => (
                                <Chip key={cls} label={cls} color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Paper>
                )}

                {detail.files && detail.files.length > 0 && (
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {workspaceT('detail.images')}
                        </Typography>
                        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="image tabs">
                            <Tab label={workspaceT('detail.all')} value={workspaceT('detail.all')} />
                            <Tab label={workspaceT('detail.none')} value={workspaceT('detail.none')} />
                            {detail.classes?.map((className) => (
                                <Tab key={className} label={className} value={className} />
                            ))}
                        </Tabs>
                        <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={164}>
                            {filteredFiles().map((file) => (
                                <ImageListItem key={file.id} onClick={() => setSelectedImage(file.url)} style={{ cursor: 'pointer' }}>
                                    <img
                                        src={file.url}
                                        alt={file.fileName}
                                        loading="lazy"
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                        <Modal
                            open={!!selectedImage}
                            onClose={() => setSelectedImage(null)}
                            aria-labelledby="image-modal"
                            aria-describedby="expanded-image"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                maxWidth: '90%',
                                maxHeight: '90%',
                                outline: 'none',
                            }}>
                                <img
                                    src={selectedImage}
                                    alt={workspaceT('detail.expandedView')}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '90vh',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Box>
                        </Modal>
                    </Paper>
                )}

                {detail.members && detail.members.length > 0 && (
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {workspaceT('members.title')}
                        </Typography>
                        <Grid container spacing={2}>
                            {detail.members.map((member) => (
                                <Grid size="auto" key={member.id}>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 1 }}>{member.name[0]}</Avatar>
                                        <Typography variant="body2">{member.name}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="error">
                    {workspaceT('actions.delete')}
                </Button>
                <Button onClick={handleEdit} color="primary">
                    {commonT('buttons.edit')}
                </Button>
                <Button onClick={handleClose} color="primary">
                    {commonT('buttons.close')}
                </Button>
            </DialogActions>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{workspaceT('detail.confirmDelete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {workspaceT('detail.deleteConfirmMessage')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                        {commonT('buttons.cancel')}
                    </Button>
                    <Button onClick={confirmDelete} color="error">
                        {workspaceT('actions.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WorkspaceDetail;
