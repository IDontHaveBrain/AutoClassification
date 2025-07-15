import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Dialog, Grid, Paper, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import BaseSearch from 'component/baseBoard/BaseSearch';
import BaseTable from 'component/baseBoard/BaseTable';
import BaseTitle from 'component/baseBoard/BaseTitle';
import { initPageable, type Pageable } from 'model/GlobalModel';
import { type WorkspaceModel } from 'model/WorkspaceModel';
import WorkspaceDetail from 'pages/contents/workspace/WorkspaceDetail';
import { getMyWorkspaceList } from 'service/Apis/WorkspaceApi';

import { onAlert } from 'utils/alert';
import { CommonUtil } from 'utils/CommonUtil';
import { WorkspaceContext } from 'utils/ContextManager';
import { Strings } from 'utils/strings';

interface Search {
    ownerEmail: string;
    name: string;
}

const WorkspaceList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({ ownerEmail: '', name: '' });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceModel | null>(null);
    const [rows, setRows] = useState<WorkspaceModel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setState } = useContext(WorkspaceContext);

    const fetchWorkspaces = useCallback(async (page: number, size: number, sort: string, search: Search) => {
        setLoading(true);
        try {
            const params = { ...search, page, size, sort };
            const res = await getMyWorkspaceList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (_error) {
            onAlert(Strings.Common.apiFailed);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces(pageable.page, pageable.size, pageable.sort, search);
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
        fetchWorkspaces(pageable.page, pageable.size, pageable.sort, search);
    };
    const handleRowClick = (params: GridRowParams) => {
        const workspace = params.row as WorkspaceModel;
        setState((prevState) => ({
            ...prevState,
            selectedData: workspace,
        }));
        handleClickOpen(workspace);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
        setPageable(prevPageable => ({ ...prevPageable, page: 0 })); // 검색 시 첫 페이지로 이동
        fetchWorkspaces(0, pageable.size, pageable.sort, search);
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: '제목', flex: 2 },
        { field: 'createMember', headerName: '생성자', flex: 2 },
        {
            field: 'createDateTime',
            headerName: '생성일',
            flex: 2,
            valueFormatter: CommonUtil.dateFormat,
        },
    ];

    const getTooltipContent = (row: WorkspaceModel) => {
        return `Name: ${row.name}\nDescription: ${row.description}\nCreated by: ${row.createMember}\nCreated at: ${CommonUtil.dateFormat({ value: row.createDateTime })}`;
    };

    const getExpandedContent = (row: WorkspaceModel) => {
        return (
            <Box sx={{ p: 2 }}>
                <p><strong>Description:</strong> {row.description}</p>
                <p><strong>Members:</strong> {row.members?.map(member => member.name).join(', ')}</p>
                <p><strong>Classes:</strong> {row.classes?.join(', ')}</p>
            </Box>
        );
    };

    return (
        <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
            <BaseTitle title={'MyWorkspace'} />

            <Box sx={{ mb: 4, mt: 3 }}>
                <BaseSearch>
                    <Grid container spacing={3} alignItems="end">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                name="name"
                                label="Workspace Name"
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
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                name="ownerEmail"
                                label="Owner Email"
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
                        <Grid item xs={12} sm={6} md={3}>
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
                                Search
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
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
                                추가
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
                    Workspace List
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
                            getExpandedContent={getExpandedContent}
                        />
                    )}
                </Box>
            </Box>

            <Dialog open={openDetail} onClose={handleClose} maxWidth="md" fullWidth>
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
