import React, { useState, useEffect } from "react";
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box, Modal, IconButton, Skeleton, Tooltip, Pagination, Tabs, Tab } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandComp from "component/ExpandComp";
import { FileModel } from "model/GlobalModel";

interface Props {
    imgs: FileModel[];
    setState: React.Dispatch<React.SetStateAction<any>>;
    isLoading?: boolean;
    error?: string | null;
    onDeleteImage?: (imageId: number) => void;
    classes?: string[];
}

const WorkspaceDataSet: React.FC<Props> = ({ imgs, setState, isLoading = false, error = null, onDeleteImage, classes }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState<string>("All"); // 기본 탭 "All"로 설정
    const imagesPerPage = 12;

    useEffect(() => {
        // 탭이 변경될 때마다 페이지를 1로 초기화
        setPage(1);
    }, [selectedTab]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
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
            <ExpandComp title="DataSet">
                <Grid container spacing={2}>
                    {[...Array(8)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Skeleton variant="rectangular" height={140} />
                            <Skeleton variant="text" />
                        </Grid>
                    ))}
                </Grid>
            </ExpandComp>
        );
    }

    if (error) {
        return (
            <ExpandComp title="DataSet">
                <Typography color="error" align="center">{error}</Typography>
            </ExpandComp>
        );
    }

    // 선택된 탭에 따라 이미지 필터링
    const filteredImages = imgs.filter((image) => {
        if (selectedTab === "All") {
            return true; // 모든 이미지 표시
        } else if (selectedTab === "None") {
            return !image.label || image.label.toLowerCase() === "none"; // 레이블이 없거나 "none"인 이미지 표시
        } else {
            return image.label === selectedTab; // 선택된 탭과 레이블이 일치하는 이미지 표시
        }
    });

    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const displayedImages = filteredImages.slice(startIndex, endIndex);

    return (
        <ExpandComp title="DataSet">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                    <Tab label="All" value="All" />
                    <Tab label="None" value="None" />
                    {classes?.map((className) => (
                        <Tab key={className} label={className} value={className} />
                    ))}
                </Tabs>
            </Box>
            {filteredImages.length === 0 ? (
                <Typography align="center">No images available</Typography>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {displayedImages.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
                                        <Tooltip title="Delete Image">
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
                        src={selectedImage}
                        alt="Expanded view"
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
