import React, { useCallback, useEffect,useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Alert, Box, Button, Card, CardContent, CircularProgress, DialogActions, DialogContent, DialogTitle, Divider,FormControl, Grid, IconButton, InputLabel, MenuItem, Modal, Select, type SelectChangeEvent, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import BaseTable from 'component/baseBoard/BaseTable';
import BaseTitle from 'component/baseBoard/BaseTitle';
import BaseInputField from 'component/BaseInputField';
import LabelledImageCard from 'component/imgs/LabelledImageCard';

import { CommonUtil } from 'utils/CommonUtil';

interface TestFile {
    id: number;
    url: string;
    fileName: string;
    originalFileName: string;
    size: number;
}

interface TestResultItem {
    label: string;
    ids: number[];
}

interface TestResultData {
    id: number;
    classes: string[];
    createDateTime: string;
    resultJson?: string;
    testFiles?: TestFile[];
}

interface Props {
    data: TestResultData;
    handleClose: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{
                    pt: 2,
                    pb: 3,
                    px: { xs: 1, sm: 2, md: 3 },
                    minHeight: '200px',
                }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const TestResultDetail: React.FC<Props> = ({ data, handleClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [result, setResult] = useState<TestResultItem[] | null>(null);
    const [images, setImages] = useState<TestFile[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('default');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [allImages, setAllImages] = useState<TestFile[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                await new Promise(resolve => setTimeout(resolve, 1000));
                const parsedResult = data?.resultJson ? JSON.parse(data.resultJson) : null;
                setResult(parsedResult);
                setImages(data?.testFiles || []);

                if (parsedResult && data?.testFiles) {
                    const allImgs = parsedResult.flatMap((item: TestResultItem) =>
                        item.ids.map(id => data.testFiles?.find(img => img.id === id)),
                    ).filter((img): img is TestFile => img !== undefined);
                    setAllImages(allImgs);
                } else {
                    // 파싱된 결과가 없으면 일관성 유지를 위해 빈 배열로 설정
                    setAllImages([]);
                }
            } catch (_err) {
                setError('Failed to load test result data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [data]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const columns = [
        { field: 'label', headerName: 'Label', flex: 1 },
        { field: 'count', headerName: 'Count', flex: 1 },
    ];

    const rows = result?.map((item, index) => ({
        id: index,
        label: item.label,
        count: item.ids.length,
    }));

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        setSortOption(event.target.value);
    };

    const sortImages = useCallback((images: TestFile[]) => {
        switch (sortOption) {
            case 'name':
                return [...images].sort((a, b) => a.originalFileName.localeCompare(b.originalFileName));
            case 'size':
                return [...images].sort((a, b) => a.size - b.size);
            default:
                return images;
        }
    }, [sortOption]);

    const downloadImages = (images: TestFile[]) => {
        images.forEach(image => {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = image.originalFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <DialogContent>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="200px"
                    gap={2}
                >
                    <CircularProgress />
                    <Typography variant="body1">Loading test result data...</Typography>
                </Box>
            </DialogContent>
        );
    }

    if (error) {
        return (
            <DialogContent>
                <Box display="flex" justifyContent="center" py={2}>
                    <Alert severity="error" sx={{ width: '100%', maxWidth: '600px' }}>
                        {error}
                    </Alert>
                </Box>
            </DialogContent>
        );
    }

    return (
        <>
            <DialogTitle>
                <BaseTitle title={`Test Result: ${data?.id}`} />
            </DialogTitle>
            <DialogContent sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                maxHeight: '70vh',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#a8a8a8',
                },
            }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {/* Metadata Section */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={2} sx={{ height: 'fit-content' }}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Metadata
                                </Typography>
                                <Stack spacing={2}>
                                    <BaseInputField
                                        label="Classes"
                                        value={data?.classes.join(', ')}
                                        aria-label="Classes"
                                        readOnly
                                    />
                                    <BaseInputField
                                        label="Created At"
                                        value={CommonUtil.dateFormat({ value: data?.createDateTime })}
                                        aria-label="Created At"
                                        readOnly
                                    />
                                    <BaseInputField
                                        label="Total Images"
                                        value={allImages?.length.toString()}
                                        aria-label="Total Images"
                                        readOnly
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Result Summary Section */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card elevation={2} sx={{ height: 'fit-content' }}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Result Summary
                                </Typography>
                                <Box sx={{
                                    minHeight: '160px',
                                    '& .MuiDataGrid-root': {
                                        border: 'none',
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #e0e0e0',
                                        },
                                    },
                                }}>
                                    <BaseTable
                                        rows={rows}
                                        columns={columns}
                                        total={rows?.length || 0}
                                        pageable={{ page: 0, size: 10 }}
                                        loadRows={() => {}}
                                        dataGridProps={{
                                            hideFooter: true,
                                            disableColumnMenu: true,
                                            showCellVerticalBorder: false,
                                            showColumnVerticalBorder: false,
                                            disableColumnSelector: true,
                                            autoHeight: true,
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Detailed Results Section */}
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                    Detailed Results
                                </Typography>

                                {/* Controls Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="sort-select-label">Sort Images</InputLabel>
                                                <Select
                                                    labelId="sort-select-label"
                                                    value={sortOption}
                                                    onChange={handleSortChange}
                                                    aria-label="Sort images"
                                                    label="Sort Images"
                                                >
                                                    <MenuItem value="default">Default</MenuItem>
                                                    <MenuItem value="name">By Name</MenuItem>
                                                    <MenuItem value="size">By Size</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<GetAppIcon />}
                                                onClick={() => downloadImages(images)}
                                                aria-label="Download all images"
                                                fullWidth={isMobile}
                                                size="small"
                                            >
                                                Download All Images
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Tabs Section - Only show if there are results */}
                                {result && result.length > 0 ? (
                                    <>
                                        <Box sx={{
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            mb: 1,
                                        }}>
                                            <Tabs
                                                value={tabValue}
                                                onChange={handleTabChange}
                                                aria-label="image categories"
                                                variant={isMobile ? 'scrollable' : 'standard'}
                                                scrollButtons={isMobile ? 'auto' : false}
                                                allowScrollButtonsMobile
                                            >
                                                <Tab
                                                    label="ALL"
                                                    id="simple-tab-all"
                                                    aria-controls="simple-tabpanel-all"
                                                    sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                                                />
                                                {result?.map((item, index) => (
                                                    <Tab
                                                        label={item.label}
                                                        id={`simple-tab-${index}`}
                                                        aria-controls={`simple-tabpanel-${index}`}
                                                        key={item.label}
                                                        sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                                                    />
                                                ))}
                                            </Tabs>
                                        </Box>
                                        {/* Tab Content */}
                                        <TabPanel value={tabValue} index={0}>
                                            <LabelledImageCard
                                                label="All Images"
                                                images={sortImages(allImages).map(img => ({ ...img, id: img.id.toString() }))}
                                                onImageClick={handleImageClick}
                                                imageSize="tiny"
                                            />
                                        </TabPanel>
                                        {result?.map((item, index) => (
                                            <TabPanel value={tabValue} index={index + 1} key={item.label}>
                                                <LabelledImageCard
                                                    label={item.label}
                                                    images={sortImages(item.ids.map((id) => images.find((img) => img.id === id)).filter((img): img is TestFile => img !== undefined)).map(img => ({ ...img, id: img.id.toString() }))}
                                                    onImageClick={handleImageClick}
                                                    imageSize="tiny"
                                                />
                                            </TabPanel>
                                        ))}
                                    </>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '200px',
                                        textAlign: 'center',
                                        gap: 2,
                                    }}>
                                        <Typography variant="h6" color="textSecondary">
                                            No classification results available
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            This test may not have completed successfully or no objects were detected in the uploaded images.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                justifyContent: 'flex-end',
                gap: 1,
            }}>
                <Button
                    onClick={handleClose}
                    color="primary"
                    variant="contained"
                    aria-label="Close dialog"
                    sx={{ minWidth: 100 }}
                >
                    Close
                </Button>
            </DialogActions>
            {/* Enhanced Image Modal */}
            <Modal
                open={!!selectedImage}
                onClose={handleCloseModal}
                aria-labelledby="image-modal"
                aria-describedby="image-modal-description"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: { xs: 2, sm: 3 },
                    maxWidth: { xs: '95%', sm: '90%', md: '80%' },
                    maxHeight: { xs: '95%', sm: '90%', md: '80%' },
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Close Button */}
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                        aria-label="Close image"
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Image Container */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'auto',
                        flex: 1,
                    }}>
                        <img
                            src={selectedImage || ''}
                            alt="Enlarged view"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '4px',
                            }}
                        />
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default TestResultDetail;
