import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Dialog, Grid, Paper, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useTranslation } from 'hooks/useTranslation';
import { initPageable, type NoticeModel, type Pageable } from 'model/GlobalModel';
import { getNoticeList } from 'service/Apis/NoticeApi';

import BaseSearch from 'components/baseBoard/BaseSearch';
import BaseTable from 'components/baseBoard/BaseTable';
import BaseTitle from 'components/baseBoard/BaseTitle';
import { onAlert } from 'utils/alert';
import { CommonUtil } from 'utils/CommonUtil';
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
    const { t } = useTranslation('notice');
    const { t: commonT } = useTranslation('common');

    const normalizeSort = (sort: string | string[] | undefined): string => {
        if (!sort) return '';
        return Array.isArray(sort) ? sort.join(',') : sort;
    };

    const fetchNotices = async (page: number, size: number, sort: string, searchParams: SearchParams) => {
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
    };

    // Fetch notices when pagination or search parameters change
    useEffect(() => {
        fetchNotices(pageable.page, pageable.size, normalizeSort(pageable.sort), search);
    }, [pageable.page, pageable.size, pageable.sort, search]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        setPageable(prevPageable => ({ ...prevPageable, page, size, sort }));
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
        setPageable(prevPageable => ({ ...prevPageable, page: 0 }));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'title', headerName: t('table.title'), flex: 2 },
        { field: 'createMember', headerName: t('table.creator'), flex: 2 },
        {
            field: 'createDateTime',
            headerName: t('table.createdAt'),
            flex: 2,
            valueFormatter: CommonUtil.dateFormat,
        },
        { field: 'updateMember', headerName: t('table.updater'), flex: 2 },
        {
            field: 'updateDateTime',
            headerName: t('table.updatedAt'),
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
            <BaseTitle title={t('general.title')} />

            <Box sx={{ mb: 4, mt: 3 }}>
                <BaseSearch>
                    <Grid container spacing={3} alignItems="end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                name="title"
                                label={t('search.title')}
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
                                label={t('search.creator')}
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
                                label={t('search.content')}
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
                                {commonT('buttons.search')}
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
                                {t('actions.create')}
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
                    {t('general.noticeList')}
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
