import React, { useCallback,useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    DialogActions,
    DialogContent,
    Grid,
    ImageList,
    ImageListItem,
    Modal,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { SseType } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import { deleteWorkspace, getWorkspace } from 'service/Apis/WorkspaceApi';

import { onAlert } from 'utils/alert';
import { eventBus } from 'utils/eventBus';
import { Strings } from 'utils/strings';

interface Props {
    data: WorkspaceModel;
    handleClose: () => void;
    onDeleteSuccess: () => void;
}

const WorkspaceDetail: React.FC<Props> = ({ data, handleClose, onDeleteSuccess }) => {
    const [detail, setDetail] = useState<WorkspaceModel | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>('All');

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    const filteredFiles = () => {
        if (!detail.files) return [];
        if (selectedTab === 'All') {
            return detail.files;
        } else if (selectedTab === 'None') {
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
            onAlert(Strings.Common.apiFailed);
        }
    }, []);

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
        if (detail) {
            deleteWorkspace(detail.id.toString())
                .then(() => {
                    handleClose();
                    onDeleteSuccess();
                    onAlert(Strings.Common.apiSuccess);
                })
                .catch((_err) => {
                    onAlert(Strings.Common.apiFailed);
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
                        Owner: {detail.owner.name} ({detail.owner.email})
                    </Typography>
                </Box>

                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Description
                    </Typography>
                    <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{
                            __html: detail.description || 'No description available.',
                        }}
                    />
                </Paper>

                {detail.classes && detail.classes.length > 0 && (
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Classes
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
                            Images
                        </Typography>
                        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="image tabs">
                            <Tab label="All" value="All" />
                            <Tab label="None" value="None" />
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
                                    alt="Expanded view"
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
                            Members
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
                    Delete
                </Button>
                <Button onClick={handleEdit} color="primary">
                    Edit
                </Button>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </>
    );
};

export default WorkspaceDetail;
