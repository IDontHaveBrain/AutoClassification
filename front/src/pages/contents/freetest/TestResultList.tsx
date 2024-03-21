import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import BaseTable from "component/baseBoard/BaseTable";
import { Pageable, initPageable } from "model/GlobalModel";
import { testGetResult } from "service/Apis/TrainApi";
import {Dialog} from "@mui/material";
import TestResultDetail from "pages/contents/freetest/TestResultDetail";


const TestResultList = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [resultList, setResultList] = useState([]);
    const [total, setTotal] = useState(0);
    const [detailData, setDetailData] = useState();

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
    }, [fetchResults]);

    const handlePageChange = (page, size, sort) => {
        const updatedPageable = { ...pageable, page, size, sort };
        setPageable(updatedPageable);
        fetchResults(updatedPageable);
    }

    const handleRowClick = (data) => {
        console.log(data);
        setDetailData(data.row);
    }

    const handleClose = () => {
        setDetailData(null);
    }

    const columns = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "classes", headerName: "Classes", flex: 3 },
        { field: "resultJson", headerName: "Result", flex: 3 },
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