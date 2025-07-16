import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress,DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { initPageable, type Member, type Pageable } from 'model/GlobalModel';
import { getMemberList } from 'service/Apis/MemberApi';

import BaseTable from 'components/baseBoard/BaseTable';
import { onAlert } from 'utils/alert';

interface Props {
    close: () => void;
    setData: (_member: Member) => void;
}

interface SearchParams {
    email: string;
}

const MemberSearchModal: React.FC<Props> = ({ close, setData }) => {
    const { t } = useTranslation('common');
    const { t: tWorkspace } = useTranslation('workspace');
    const { t: tApi } = useTranslation('api');
    const [search, setSearch] = useState<SearchParams>({ email: '' });
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [members, setMembers] = useState<Member[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: t('id'), width: 70 },
        { field: 'email', headerName: t('email'), width: 130 },
        { field: 'name', headerName: t('name'), width: 130 },
    ];

    const handleRowClick = (params: GridRowParams) => {
        setData(params.row as Member);
        close();
    };

    const loadRows = useCallback((page: number, size: number, sort: string) => {
        setLoading(true);
        const params = { ...search, page, size, sort };
        setPageable(prevPageable => ({ ...prevPageable, page, size, sort }));

        getMemberList(params)
            .then((response) => {
                setMembers(response.data.content || []);
                setTotalMembers(response.data.totalElements);
            })
            .catch((_error) => {
                onAlert(tApi('requestFailed'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [search, tApi]);

    useEffect(() => {
        const sortValue = Array.isArray(pageable.sort) ? pageable.sort.join(',') : (pageable.sort || '');
        loadRows(pageable.page, pageable.size, sortValue);
    }, [loadRows, pageable.page, pageable.size, pageable.sort]);

    return (
        <>
            <DialogTitle>{tWorkspace('memberSearch')}</DialogTitle>
            <DialogContent>
                <TextField
                    label={t('email')}
                    variant="outlined"
                    name="email"
                    value={search.email}
                    onChange={handleSearch}
                    fullWidth
                />
                {loading ? (
                    <CircularProgress />
                ) : (
                    <BaseTable
                        rows={members}
                        total={totalMembers}
                        columns={columns}
                        pageable={pageable}
                        loadRows={loadRows}
                        onClick={handleRowClick}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>{t('close')}</Button>
            </DialogActions>
        </>
    );
};

export default MemberSearchModal;
