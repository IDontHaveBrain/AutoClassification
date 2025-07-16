import React, { useCallback, useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Alert, Box, Button, Card, CardContent, CircularProgress, DialogActions, DialogContent, DialogTitle, Divider,FormControl, Grid, IconButton, InputLabel, MenuItem, Modal, Select, type SelectChangeEvent, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';

import BaseTable from 'components/baseBoard/BaseTable';
import BaseTitle from 'components/baseBoard/BaseTitle';
import BaseInputField from 'components/BaseInputField';
import LabelledImageCard from 'components/imgs/LabelledImageCard';
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
    const { t: tTest } = useTranslation('test');
    const { t: tCommon } = useTranslation('common');
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
                        item.ids.map(id => data.testFiles?.find((img: TestFile) => img.id === id)),
                    ).filter((img: TestFile | undefined): img is TestFile => img !== undefined);
                    setAllImages(allImgs);
                } else {
                    setAllImages([]);
                }
            } catch (_err) {
                setError(tTest('messages.loadDataFailed'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [data, tTest]);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const columns = [
        { field: 'label', headerName: tCommon('label'), flex: 1 },
        { field: 'count', headerName: tCommon('count'), flex: 1 },
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

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
                    <Typography variant="body1">{tTest('messages.loadingTestData')}</Typography>
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
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card elevation={2} sx={{ height: 'fit-content' }}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    {tCommon('metadata')}
                                </Typography>
                                <Stack spacing={2}>
                                    <BaseInputField
                                        label={tCommon('classes')}
                                        value={data?.classes.join(', ')}
                                        aria-label={tCommon('classes')}
                                        readOnly
                                    />
                                    <BaseInputField
                                        label={tCommon('createdAt')}
                                        value={CommonUtil.dateFormat({ value: data?.createDateTime })}
                                        aria-label={tCommon('createdAt')}
                                        readOnly
                                    />
                                    <BaseInputField
                                        label={tCommon('totalImages')}
                                        value={allImages?.length.toString()}
                                        aria-label={tCommon('totalImages')}
                                        readOnly
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card elevation={2} sx={{ height: 'fit-content' }}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    {tCommon('resultSummary')}
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
                                        rows={rows || []}
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

                    <Grid size={{ xs: 12 }}>
                        <Card elevation={2}>
                            <CardContent sx={{ pb: '16px !important' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                    {tCommon('detailedResults')}
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="sort-select-label">{tCommon('sortImages')}</InputLabel>
                                                <Select
                                                    labelId="sort-select-label"
                                                    value={sortOption}
                                                    onChange={handleSortChange}
                                                    aria-label={tCommon('sortImagesAriaLabel')}
                                                    label={tCommon('sortImages')}
                                                >
                                                    <MenuItem value="default">{tCommon('default')}</MenuItem>
                                                    <MenuItem value="name">{tCommon('byName')}</MenuItem>
                                                    <MenuItem value="size">{tCommon('bySize')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<GetAppIcon />}
                                                onClick={() => downloadImages(images)}
                                                aria-label={tCommon('downloadAllImagesAriaLabel')}
                                                fullWidth={isMobile}
                                                size="small"
                                            >
                                                {tCommon('downloadAllImages')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

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
                                                    label={tCommon('all').toUpperCase()}
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
                                        <TabPanel value={tabValue} index={0}>
                                            <LabelledImageCard
                                                label={tCommon('allImages')}
                                                images={sortImages(allImages || []).map(img => ({ ...img, id: img.id.toString() }))}
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
                                            {tTest('result.noResults')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {tTest('result.noResultsDescription')}
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
                    aria-label={tCommon('closeDialog')}
                    sx={{ minWidth: 100 }}
                >
                    {tCommon('close')}
                </Button>
            </DialogActions>
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
                        aria-label={tCommon('closeImage')}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'auto',
                        flex: 1,
                    }}>
                        <img
                            src={selectedImage || ''}
                            alt={tCommon('enlargedViewAlt')}
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
