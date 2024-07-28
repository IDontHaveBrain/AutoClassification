import React, { useState, useCallback, useEffect } from "react";
import { DialogActions, DialogContent, DialogTitle, Button, Grid, Card, CardContent, Typography, useMediaQuery, useTheme, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, CircularProgress, Alert, Modal, Box, Tabs, Tab } from "@mui/material";
import GetAppIcon from '@mui/icons-material/GetApp';
import LabelledImageCard from "component/imgs/LabelledImageCard";
import BaseTable from "component/baseBoard/BaseTable";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseInputField from "component/BaseInputField";
import { CommonUtil } from "utils/CommonUtil";

interface Props {
    data: any;
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
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const TestResultDetail: React.FC<Props> = ({ data, handleClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [result, setResult] = useState<any>(null);
    const [images, setImages] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('default');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                await new Promise(resolve => setTimeout(resolve, 1000));
                setResult(data?.resultJson ? JSON.parse(data.resultJson) : null);
                setImages(data?.testFiles || []);
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load test result data. Please try again.");
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

    const sortImages = useCallback((images: any[]) => {
        switch (sortOption) {
            case 'name':
                return [...images].sort((a, b) => a.originalFileName.localeCompare(b.originalFileName));
            case 'size':
                return [...images].sort((a, b) => a.size - b.size);
            default:
                return images;
        }
    }, [sortOption]);

    const downloadImages = (images: any[]) => {
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
                <CircularProgress />
                <Typography>Loading test result data...</Typography>
            </DialogContent>
        );
    }

    if (error) {
        return (
            <DialogContent>
                <Alert severity="error">{error}</Alert>
            </DialogContent>
        );
    }

    return (
        <>
            <DialogTitle>
                <BaseTitle title={`Test Result: ${data?.id}`} />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Metadata</Typography>
                                <BaseInputField label="Classes" value={data?.classes.join(', ')} aria-label="Classes" />
                                <BaseInputField label="Created At" value={CommonUtil.dateFormat({ value: data?.createDateTime })} aria-label="Created At" />
                                <BaseInputField label="Total Images" value={images?.length.toString()} aria-label="Total Images" />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Result Summary</Typography>
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
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Detailed Results</Typography>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="sort-select-label">Sort Images</InputLabel>
                                            <Select
                                                labelId="sort-select-label"
                                                value={sortOption}
                                                onChange={handleSortChange}
                                                aria-label="Sort images"
                                            >
                                                <MenuItem value="default">Default</MenuItem>
                                                <MenuItem value="name">By Name</MenuItem>
                                                <MenuItem value="size">By Size</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<GetAppIcon />}
                                            onClick={() => downloadImages(images)}
                                            aria-label="Download all images"
                                        >
                                            Download All Images
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="image categories">
                                        {result?.map((item, index) => (
                                            <Tab label={item.label} id={`simple-tab-${index}`} aria-controls={`simple-tabpanel-${index}`} key={item.label} />
                                        ))}
                                    </Tabs>
                                </Box>
                                {result?.map((item, index) => (
                                    <TabPanel value={tabValue} index={index} key={item.label}>
                                        <LabelledImageCard
                                            label={item.label}
                                            images={sortImages(item.ids.map((id) => images.find((img) => img.id === id)))}
                                            onImageClick={handleImageClick}
                                            imageSize="small"
                                        />
                                    </TabPanel>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary" variant="contained" aria-label="Close dialog">
                    Close
                </Button>
            </DialogActions>
            <Modal
                open={!!selectedImage}
                onClose={handleCloseModal}
                aria-labelledby="image-modal"
                aria-describedby="image-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflow: 'auto',
                }}>
                    <img src={selectedImage} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
                </Box>
            </Modal>
        </>
    );
}

export default TestResultDetail;
