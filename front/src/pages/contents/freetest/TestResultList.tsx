import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@mui/material';
import Box from '@mui/material/Box';
import { type GridColDef, type GridRowParams, type GridValidRowModel } from '@mui/x-data-grid';
import { initPageable,type Pageable } from 'model/GlobalModel';
import TestResultDetail from 'pages/contents/freetest/TestResultDetail';
import { testGetResult } from 'service/Apis/TrainApi';
import { type TestResultParams } from 'types';

import BaseTable from 'components/baseBoard/BaseTable';
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

interface TestResultData extends GridValidRowModel {
    id: number;
    classes: string[];
    createDateTime: string;
    resultJson?: string;
    testFiles?: TestFile[];
}

const TestResultList: React.FC = () => {
    const { t: tTest } = useTranslation('test');
    const { t: tCommon } = useTranslation('common');
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [resultList, setResultList] = useState<TestResultData[]>([]);
    const [total, setTotal] = useState(0);
    const [detailData, setDetailData] = useState<TestResultData | undefined>();

    const fetchResults = useCallback(async (pageable: Pageable) => {
        try {
            const testParams: TestResultParams = {
                page: pageable.page,
                size: pageable.size,
            };
            const res = await testGetResult(testParams);
            setResultList(res.data.content);
            setTotal(res.data.totalElements);
        } catch (_error) {
            // 에러 발생 시 사용자 알림 없이 조용히 처리하는 의도적 설계
        }
    }, []);

    useEffect(() => {
        fetchResults(pageable);
    }, [fetchResults, pageable]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        const updatedPageable = { ...pageable, page, size, sort };
        setPageable(updatedPageable);
        fetchResults(updatedPageable);
    };

    const handleRowClick = (params: GridRowParams<GridValidRowModel>) => {
        const testResult = params.row as TestResultData;
        setDetailData(testResult);
    };

    const handleClose = () => {
        setDetailData(undefined);
    };

    const parseResultJson = (resultJson: string) => {
        try {
            const parsed = JSON.parse(resultJson);
            return parsed.map((item: TestResultItem) => `${item.label}: ${item.ids.length}`).join(', ');
        } catch (_error) {
            return tTest('messages.invalidJson');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: tCommon('id'), width: 70, align: 'right', type: 'number' },
        { field: 'classes', headerName: tCommon('classes'), flex: 2, type: 'string' },
        {
            field: 'resultJson',
            headerName: tCommon('resultSummary'),
            flex: 3,
            type: 'string',
            renderCell: (params) => parseResultJson(params.value),
        },
        {
            field: 'createDateTime',
            headerName: tCommon('date'),
            flex: 2,
            type: 'dateTime',
            valueFormatter: (params: { value: string }) => CommonUtil.dateFormat({ value: params.value }),
        },
    ];

    return (
        <Box>
            <BaseTable
                rows={resultList}
                total={total}
                columns={columns}
                pageable={pageable}
                loadRows={handlePageChange}
                onClick={handleRowClick}
            />

            <Dialog
                open={!!detailData}
                onClose={handleClose}
                closeAfterTransition={false}
                maxWidth="xl"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        maxHeight: '90vh',
                        height: 'auto',
                        margin: '16px',
                    },
                }}
            >
                {detailData && <TestResultDetail data={detailData} handleClose={handleClose} />}
            </Dialog>
        </Box>
    );
};

export default TestResultList;
