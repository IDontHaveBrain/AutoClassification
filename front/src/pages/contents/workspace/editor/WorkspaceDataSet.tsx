import React, { useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Card, CardContent, CardMedia, Grid, IconButton, Modal, Pagination, Skeleton, Tab,Tabs, Tooltip, Typography } from '@mui/material';
import { type FileModel } from 'model/GlobalModel';

import ExpandComp from 'components/ExpandComp';

interface Props {
    imgs: FileModel[];
    setState?: React.Dispatch<React.SetStateAction<FileModel[]>>;
    isLoading?: boolean;
    error?: string | null;
    onDeleteImage?: (_imageId: number) => void;
    classes?: string[];
}

const WorkspaceDataSet: React.FC<Props> = ({ imgs, setState: _setState, isLoading = false, error = null, onDeleteImage, classes }) => {
    const { t } = useTranslation('common');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState<string>('All');
    const imagesPerPage = 12;

    useEffect(() => {
        setPage(1);
    }, [selectedTab]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    const handleDeleteImage = (event: React.MouseEvent, imageId: number) => {
        event.stopPropagation();
        if (onDeleteImage) {
            onDeleteImage(imageId);
        }
    };

    if (isLoading) {
        return (
            <ExpandComp title={t('dataSet')}>
                <Grid container spacing={2}>
                    {[...Array(8)].map((_, index) => {
                        const skeletonId = `skeleton-loader-${8 - index}`;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={skeletonId}>
                                <Skeleton variant="rectangular" height={140} />
                                <Skeleton variant="text" />
                            </Grid>
                        );
                    })}
                </Grid>
            </ExpandComp>
        );
    }

    if (error) {
        return (
            <ExpandComp title={t('dataSet')}>
                <Typography color="error" align="center">{error}</Typography>
            </ExpandComp>
        );
    }

    const filteredImages = imgs.filter((image) => {
        if (selectedTab === 'All') {
            return true;
        } else if (selectedTab === 'None') {
            return !image.label || image.label.toLowerCase() === 'none';
        } else {
            return image.label === selectedTab;
        }
    });

    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const displayedImages = filteredImages.slice(startIndex, endIndex);

    return (
        <ExpandComp title={t('dataSet')}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                    <Tab label={t('all')} value="All" />
                    <Tab label={t('none')} value="None" />
                    {classes?.map((className) => (
                        <Tab key={className} label={className} value={className} />
                    ))}
                </Tabs>
            </Box>
            {filteredImages.length === 0 ? (
                <Typography align="center">{t('noImagesAvailable')}</Typography>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {displayedImages.map((image) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={image.id}>
                                <Card
                                    onClick={() => handleImageClick(image.url)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: '0.3s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 3,
                                        },
                                        position: 'relative',
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={image.url}
                                        alt={image.fileName}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {image.originalFileName}
                                        </Typography>
                                    </CardContent>
                                    {onDeleteImage && (
                                        <Tooltip title={t('deleteImage')}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleDeleteImage(e, image.id)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    right: 5,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={Math.ceil(filteredImages.length / imagesPerPage)}
                            page={page}
                            onChange={handleChangePage}
                            color="primary"
                        />
                    </Box>
                </>
            )}
            <Modal
                open={!!selectedImage}
                onClose={handleCloseModal}
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
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 2,
                    borderRadius: 2,
                    outline: 'none',
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <img
                        src={selectedImage || ''}
                        alt={t('expandedView')}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(90vh - 48px)',
                            objectFit: 'contain',
                        }}
                    />
                </Box>
            </Modal>
        </ExpandComp>
    );
};

export default WorkspaceDataSet;
