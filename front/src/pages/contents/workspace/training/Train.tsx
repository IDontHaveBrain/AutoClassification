import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, Box,Button, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import WorkspaceDataSet from 'pages/contents/workspace/editor/WorkspaceDataSet';
import { requestTrain } from 'service/Apis/TrainApi';
import { getMyWorkspaceList, getWorkspace } from 'service/Apis/WorkspaceApi';

import BaseTitle from 'components/baseBoard/BaseTitle';
import LabelledImages from 'components/imgs/LabelledImages';
import { onAlert } from 'utils/alert';

const Train: React.FC = () => {
    const { t: tWorkspace } = useTranslation('workspace');
    const { t: tCommon } = useTranslation('common');
    const { t: tApi } = useTranslation('api');
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getMyWorkspaceList({ size: 100 })
            .then((res) => {
                setWorkspaceList(res.data.content);
            })
            .catch((_err) => {
                onAlert(tApi('requestFailed'));
            })
            .finally(() => setIsLoading(false));
    }, [tApi]);

    const handleSelectChange = (_: React.SyntheticEvent, newValue: WorkspaceModel | null) => {
        if (newValue) {
            setIsLoading(true);
            getWorkspace(newValue.id)
                .then(res => {
                    setSelected(res.data);
                })
                .catch(_err => {
                    onAlert(tApi('requestFailed'));
                })
                .finally(() => setIsLoading(false));
        } else {
            setSelected(null);
        }
    };

    const handleTrainRequest = () => {
        if (!selected) {
            onAlert(tWorkspace('training.selectWorkspaceError'));
            return;
        }
        if (!selected.files || selected.files.length === 0) {
            onAlert(tWorkspace('training.noImagesToLabelError'));
            return;
        }

        setIsLoading(true);
        requestTrain(selected.id)
            .then(() => {
                onAlert(tApi('requestSuccess'));
            })
            .catch((_err) => {
                onAlert(tApi('requestFailed'));
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
            <BaseTitle title={tWorkspace('training.title')} />

            <Box sx={{ mb: 4, mt: 3 }}>
                <Grid container spacing={3} alignItems="end">
                    <Grid size={{ xs: 12, sm: 8, md: 7, lg: 6, xl: 5 }}>
                        <Autocomplete
                            options={workspaceList}
                            getOptionLabel={(option) => option.name}
                            value={selected}
                            onChange={handleSelectChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={tCommon('selectWorkspace')}
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        minWidth: 300,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            minHeight: 56,
                                            padding: '0 14px',
                                            fontSize: '1rem',
                                            backgroundColor: 'background.paper',
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main',
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '&.Mui-focused': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main',
                                                    borderWidth: '2px',
                                                },
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            '&.Mui-focused': {
                                                color: 'primary.main',
                                                fontWeight: 600,
                                            },
                                        },
                                        '& .MuiAutocomplete-input': {
                                            padding: '12px 0 !important',
                                            fontSize: '1rem',
                                        },
                                    }}
                                />
                            )}
                            disabled={isLoading}
                            sx={{
                                minWidth: 300,
                                '& .MuiAutocomplete-inputRoot': {
                                    borderRadius: 2,
                                },
                                '& .MuiAutocomplete-popupIndicator': {
                                    padding: '8px',
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.5rem',
                                    },
                                },
                                '& .MuiAutocomplete-clearIndicator': {
                                    padding: '8px',
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.25rem',
                                    },
                                },
                                '& .MuiAutocomplete-option': {
                                    padding: '12px 16px',
                                    fontSize: '1rem',
                                    '&[aria-selected="true"]': {
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'action.hover',
                                    },
                                },
                            }}
                            componentsProps={{
                                popper: {
                                    sx: {
                                        '& .MuiAutocomplete-listbox': {
                                            maxHeight: 300,
                                        },
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <Button
                            onClick={handleTrainRequest}
                            variant="contained"
                            color="primary"
                            disabled={!selected || isLoading}
                            fullWidth
                            size="large"
                            sx={{
                                height: 56,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-1px)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'grey.300',
                                    color: 'grey.500',
                                    boxShadow: 'none',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                tWorkspace('training.trainRequest').toUpperCase()
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {selected && (
                <Box sx={{ mt: 4 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 2,
                                }}
                            >
                                {tWorkspace('training.workspaceData')}
                            </Typography>
                            <Box sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: 'background.paper',
                            }}>
                                <WorkspaceDataSet
                                    imgs={selected.files || []}
                                    isLoading={isLoading}
                                    classes={selected.classes || []}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 2,
                                }}
                            >
                                {tCommon('labelledImages')}
                            </Typography>
                            <Box sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: 'background.paper',
                            }}>
                                <LabelledImages files={selected.files || []} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Paper>
    );
};

export default Train;
