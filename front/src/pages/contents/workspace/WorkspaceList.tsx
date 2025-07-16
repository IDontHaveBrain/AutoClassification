import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Dialog, Grid, Paper, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { type GridColDef, type GridRowParams, type GridValidRowModel } from '@mui/x-data-grid';
import { initPageable, type Pageable } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import WorkspaceDetail from 'pages/contents/workspace/WorkspaceDetail';
import { getMyWorkspaceList } from 'service/Apis/WorkspaceApi';

import BaseSearch from 'components/baseBoard/BaseSearch';
import BaseTable from 'components/baseBoard/BaseTable';
import BaseTitle from 'components/baseBoard/BaseTitle';
import { onAlert } from 'utils/alert';
import { CommonUtil } from 'utils/CommonUtil';
import { WorkspaceContext } from 'utils/ContextManager';

interface Search {
    ownerEmail: string;
    name: string;
}

const WorkspaceList: React.FC = () => {
    const { t: tApi } = useTranslation('api');
    const { t: tWorkspace } = useTranslation('workspace');
    const { t: tCommon } = useTranslation('common');
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({ ownerEmail: '', name: '' });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceModel | null>(null);
    const [rows, setRows] = useState<WorkspaceModel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const context = useContext(WorkspaceContext);
    const setState = context?.setState;

    const normalizeSort = (sort: string | string[] | undefined): string => {
        if (!sort) return '';
        return Array.isArray(sort) ? sort.join(',') : sort;
    };

    const fetchWorkspaces = useCallback(async (page: number, size: number, sort: string, search: Search) => {
        setLoading(true);
        try {
            const params = { ...search, page, size, sort };
            const res = await getMyWorkspaceList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (_error) {
            onAlert(tApi('requestFailed'));
        } finally {
            setLoading(false);
        }
    }, [tApi]);

    useEffect(() => {
        fetchWorkspaces(pageable.page, pageable.size, normalizeSort(pageable.sort), search);
        // eslint-disable-next-line
    }, []);

    const handlePageChange = (page: number, size: number, sort: string) => {
        setPageable(prevPageable => ({ ...prevPageable, page, size, sort }));
        fetchWorkspaces(page, size, sort, search);
    };

    const addWorkspace = () => {
        navigate('/workspace/editor');
    };

    const handleClickOpen = (workspace: WorkspaceModel) => {
        setSelectedWorkspace(workspace);
        setOpenDetail(true);
    };
    const handleClose = () => {
        setOpenDetail(false);
        setSelectedWorkspace(null);
    };

    const handleDeleteSuccess = () => {
        fetchWorkspaces(pageable.page, pageable.size, normalizeSort(pageable.sort), search);
    };
    const handleRowClick = (params: GridRowParams) => {
        const workspace = params.row as WorkspaceModel;
        setState?.((prevState: unknown) => ({
            ...(prevState as object),
            selectedData: workspace,
        }));
        handleClickOpen(workspace);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
        setPageable(prevPageable => ({ ...prevPageable, page: 0 }));
        fetchWorkspaces(0, pageable.size, normalizeSort(pageable.sort), search);
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: tWorkspace('item.title'), flex: 2 },
        { field: 'createMember', headerName: tWorkspace('item.creator'), flex: 2 },
        {
            field: 'createDateTime',
            headerName: tWorkspace('item.createdDate'),
            flex: 2,
            valueFormatter: (value: string | number | Date) => CommonUtil.dateFormat({ value }),
        },
    ];

    const getTooltipContent = (row: GridValidRowModel) => {
        const workspace = row as WorkspaceModel;
        return `${tCommon('common.name')}: ${workspace.name}\n${tCommon('common.description')}: ${workspace.description}\n${tCommon('common.createdBy')}: ${workspace.createMember}\n${tCommon('common.createdAt')}: ${workspace.createDateTime ? CommonUtil.dateFormat({ value: workspace.createDateTime }) : 'N/A'}`;
    };

    return (
        <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
            <BaseTitle title={tWorkspace('list.myWorkspace')} />

            <Box sx={{ mb: 4, mt: 3 }}>
                <BaseSearch>
                    <Grid container spacing={3} alignItems="end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="name"
                                label={tWorkspace('list.workspaceNameField')}
                                variant="outlined"
                                fullWidth
                                value={search.name}
                                onChange={handleSearchChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="ownerEmail"
                                label={tWorkspace('list.ownerEmailField')}
                                variant="outlined"
                                fullWidth
                                value={search.ownerEmail}
                                onChange={handleSearchChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                fullWidth
                                size="large"
                                sx={{
                                    height: 56,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4,
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                {tCommon('search')}
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button
                                color="success"
                                variant="contained"
                                onClick={addWorkspace}
                                fullWidth
                                size="large"
                                sx={{
                                    height: 56,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.5px',
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4,
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                {tWorkspace('list.addWorkspace')}
                            </Button>
                        </Grid>
                    </Grid>
                </BaseSearch>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2,
                    }}
                >
                    {tWorkspace('list.workspaceListTitle')}
                </Typography>
                <Box sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: 'background.paper',
                }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <BaseTable
                            rows={rows}
                            total={total}
                            columns={columns}
                            pageable={pageable}
                            loadRows={handlePageChange}
                            onClick={handleRowClick}
                            getTooltipContent={getTooltipContent}
                        />
                    )}
                </Box>
            </Box>

            <Dialog open={openDetail} onClose={handleClose} closeAfterTransition={false} maxWidth="md" fullWidth>
                {selectedWorkspace && (
                    <WorkspaceDetail
                        handleClose={handleClose}
                        data={selectedWorkspace}
                        onDeleteSuccess={handleDeleteSuccess}
                    />
                )}
            </Dialog>
        </Paper>
    );
};

export default WorkspaceList;
