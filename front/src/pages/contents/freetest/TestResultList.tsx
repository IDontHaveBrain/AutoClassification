import React, { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import Box from '@mui/material/Box';
import { type GridColDef } from '@mui/x-data-grid';
import BaseTable from 'component/baseBoard/BaseTable';
import { initPageable,type Pageable } from 'model/GlobalModel';
import TestResultDetail from 'pages/contents/freetest/TestResultDetail';
import { testGetResult } from 'service/Apis/TrainApi';

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

const TestResultList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [resultList, setResultList] = useState<TestResultData[]>([]);
    const [total, setTotal] = useState(0);
    const [detailData, setDetailData] = useState<TestResultData | undefined>();

    const fetchResults = useCallback(async (pageable: Pageable) => {
        try {
            const res = await testGetResult(pageable);
            setResultList(res.data.content);
            setTotal(res.data.totalElements);
        } catch (_error) {
            // 에러를 조용히 처리
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

    const handleRowClick = (data: { row: TestResultData }) => {
        setDetailData(data.row);
    };

    const handleClose = () => {
        setDetailData(undefined);
    };

    const parseResultJson = (resultJson: string) => {
        try {
            const parsed = JSON.parse(resultJson);
            return parsed.map((item: TestResultItem) => `${item.label}: ${item.ids.length}`).join(', ');
        } catch (_error) {
            return 'Invalid JSON';
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70, align: 'right', type: 'number' },
        { field: 'classes', headerName: 'Classes', flex: 2, type: 'string' },
        {
            field: 'resultJson',
            headerName: 'Result Summary',
            flex: 3,
            type: 'string',
            renderCell: (params) => parseResultJson(params.value),
        },
        {
            field: 'createDateTime',
            headerName: 'Date',
            flex: 2,
            type: 'dateTime',
            valueFormatter: (params) => CommonUtil.dateFormat({ value: params.value }),
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
                <TestResultDetail data={detailData} handleClose={handleClose} />
            </Dialog>
        </Box>
    );
};

export default TestResultList;
