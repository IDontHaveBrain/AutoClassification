import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import BaseTable from "component/baseBoard/BaseTable";
import { Pageable, initPageable } from "model/GlobalModel";
import { testGetResult } from "service/Apis/TrainApi";
import { Dialog } from "@mui/material";
import TestResultDetail from "pages/contents/freetest/TestResultDetail";
import { CommonUtil } from "utils/CommonUtil";
import { GridColDef } from "@mui/x-data-grid";

const TestResultList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [resultList, setResultList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [detailData, setDetailData] = useState<any>();

    const fetchResults = useCallback(async (pageable: Pageable) => {
        try {
            const res = await testGetResult(pageable);
            setResultList(res.data.content);
            setTotal(res.data.totalElements);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchResults(pageable);
    }, [fetchResults, pageable]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        const updatedPageable = { ...pageable, page, size, sort };
        setPageable(updatedPageable);
        fetchResults(updatedPageable);
    }

    const handleRowClick = (data: any) => {
        setDetailData(data.row);
    }

    const handleClose = () => {
        setDetailData(undefined);
    }

    const parseResultJson = (resultJson: string) => {
        try {
            const parsed = JSON.parse(resultJson);
            return parsed.map((item: any) => `${item.label}: ${item.ids.length}`).join(", ");
        } catch (error) {
            console.error("Error parsing resultJson:", error);
            return "Invalid JSON";
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70, align: "right", type: 'number' },
        { field: "classes", headerName: "Classes", flex: 2, type: 'string' },
        { 
            field: "resultJson", 
            headerName: "Result Summary", 
            flex: 3,
            type: 'string',
            renderCell: (params) => parseResultJson(params.value)
        },
        { 
            field: "createDateTime", 
            headerName: "Date", 
            flex: 2,
            type: 'dateTime',
            valueFormatter: (params) => CommonUtil.dateFormat({ value: params.value })
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

            <Dialog open={!!detailData} onClose={handleClose}>
                <TestResultDetail data={detailData} handleClose={handleClose} />
            </Dialog>
        </Box>
    );
};

export default TestResultList;
