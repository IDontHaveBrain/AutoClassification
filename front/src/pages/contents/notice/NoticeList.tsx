import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Dialog, Grid, Paper, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import BaseSearch from 'component/baseBoard/BaseSearch';
import BaseTable from 'component/baseBoard/BaseTable';
import BaseTitle from 'component/baseBoard/BaseTitle';
import { initPageable, type NoticeModel, type Pageable, SseType } from 'model/GlobalModel';
import { getNoticeList } from 'service/Apis/NoticeApi';

import { onAlert } from 'utils/alert';
import { CommonUtil } from 'utils/CommonUtil';
import { eventBus } from 'utils/eventBus';
import { Strings } from 'utils/strings';

import NoticeDetail from './NoticeDetail';

interface SearchParams {
    title: string;
    createMember: string;
    content: string;
}

const NoticeList: React.FC = () => {
    const [search, setSearch] = useState<SearchParams>({ title: '', createMember: '', content: '' });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedData, setSelectedData] = useState<NoticeModel | undefined>();
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [rows, setRows] = useState<NoticeModel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const normalizeSort = (sort: string | string[] | undefined): string => {
        if (!sort) return '';
        return Array.isArray(sort) ? sort.join(',') : sort;
    };

    const fetchNotices = useCallback(async (page: number, size: number, sort: string, searchParams: SearchParams) => {
        setLoading(true);
        try {
            const params = { ...searchParams, page, size, sort };
            const res = await getNoticeList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (_error) {
            onAlert(Strings.Common.apiFailed);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices(pageable.page, pageable.size, normalizeSort(pageable.sort), search);

        const handleNoticeUpdate = () => {
            fetchNotices(pageable.page, pageable.size, normalizeSort(pageable.sort), search);
        };

        eventBus.subscribe(SseType.NOTICE, handleNoticeUpdate);

        return () => {
            eventBus.unsubscribe(SseType.NOTICE, handleNoticeUpdate);
        };
    }, [fetchNotices, pageable, search]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        setPageable(prevPageable => ({ ...prevPageable, page, size, sort }));
        fetchNotices(page, size, sort, search);
    };

    const handleRowClick = (params: GridRowParams) => {
        setSelectedData(params.row as NoticeModel);
        setOpenDetail(true);
    };

    const handleClose = () => {
        setOpenDetail(false);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const onSearch = () => {
        fetchNotices(0, pageable.size, normalizeSort(pageable.sort), search);
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'title', headerName: '제목', flex: 2 },
        { field: 'createMember', headerName: '작성자', flex: 2 },
        {
            field: 'createDateTime',
            headerName: '작성일',
            flex: 2,
            valueFormatter: CommonUtil.dateFormat,
        },
        { field: 'updateMember', headerName: '수정자', flex: 2 },
        {
            field: 'updateDateTime',
            headerName: '수정일',
            flex: 2,
            valueFormatter: CommonUtil.dateFormat,
        },
    ];

    const onClickWrite = () => navigate('/notice/write');

    const getTooltipContent = (row: NoticeModel) => {
        return `Title: ${row.title}\nCreated by: ${row.createMember}\nCreated at: ${CommonUtil.dateFormat({ value: row.createDateTime })}\nUpdated by: ${row.updateMember}\nUpdated at: ${CommonUtil.dateFormat({ value: row.updateDateTime })}`;
    };

    return (
        <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
            <BaseTitle title={'공지사항'} />

            <Box sx={{ mb: 4, mt: 3 }}>
                <BaseSearch>
                    <Grid container spacing={3} alignItems="end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="title"
                                label="Title"
                                variant="outlined"
                                fullWidth
                                value={search.title}
                                onChange={handleSearch}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="createMember"
                                label="Creator"
                                variant="outlined"
                                fullWidth
                                value={search.createMember}
                                onChange={handleSearch}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="content"
                                label="Content"
                                variant="outlined"
                                fullWidth
                                value={search.content}
                                onChange={handleSearch}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                            <Button
                                variant="contained"
                                onClick={onSearch}
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
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                            <Button
                                color="success"
                                variant="contained"
                                onClick={onClickWrite}
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
                                작성하기
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
                    Notice List
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

            <Dialog open={openDetail} onClose={handleClose}>
                <NoticeDetail handleClose={handleClose} data={selectedData} />
            </Dialog>
        </Paper>
    );
};

export default NoticeList;
