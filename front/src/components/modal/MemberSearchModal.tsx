import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress,DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useTranslation } from 'hooks/useTranslation';
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
    const [search, setSearch] = useState<SearchParams>({ email: '' });
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [members, setMembers] = useState<Member[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: t('common.table.id'), width: 70 },
        { field: 'email', headerName: t('common.table.email'), width: 130 },
        { field: 'name', headerName: t('common.table.name'), width: 130 },
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
                onAlert(t('common.messages.apiFailed'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [search, t]);

    useEffect(() => {
        const sortValue = Array.isArray(pageable.sort) ? pageable.sort.join(',') : (pageable.sort || '');
        loadRows(pageable.page, pageable.size, sortValue);
    }, [loadRows, pageable.page, pageable.size, pageable.sort]);

    return (
        <>
            <DialogTitle>{t('common.modals.memberSearch')}</DialogTitle>
            <DialogContent>
                <TextField
                    label={t('common.forms.email')}
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
                <Button onClick={close}>{t('common.buttons.close')}</Button>
            </DialogActions>
        </>
    );
};

export default MemberSearchModal;
