import React, { useCallback, useContext, useEffect, useState } from "react";
import { WorkspaceModel } from "model/WorkspaceModel";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseTable from "component/baseBoard/BaseTable";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { CommonUtil } from "utils/CommonUtil";
import { initPageable, Pageable } from "model/GlobalModel";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import WorkspaceDetail from "pages/contents/workspace/WorkspaceDetail";
import { getMyWorkspaceList } from "service/Apis/WorkspaceApi";
import { WorkspaceContext } from "utils/ContextManager";

interface Search {
    createMember: string;
}

const WorkspaceList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({createMember: ""});
    const [openDetail, setOpenDetail] = useState(false);
    const [rows, setRows] = useState<WorkspaceModel[]>([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const { setState } = useContext(WorkspaceContext);

    const fetchWorkspaces = useCallback(async (page: number, size: number, sort: string, search: Search) => {
        try {
            const params = {...search, page, size, sort};
            const res = await getMyWorkspaceList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces(pageable.page, pageable.size, pageable.sort, search);
    }, [fetchWorkspaces, pageable, search]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        setPageable(prevPageable => ({...prevPageable, page, size, sort}));
        fetchWorkspaces(page, size, sort, search);
    }

    const addWorkspace = () => {
        navigate("/workspace/editor");
    };

    const handleClickOpen = () => setOpenDetail(true);
    const handleClose = () => setOpenDetail(false);
    const handleRowClick = (params: GridRowParams) => {
        setState((prevState) => ({
            ...prevState,
            selectedData: params.row as WorkspaceModel,
        }));
        handleClickOpen();
    };

    const columns: GridColDef[] = [
        {field: "name", headerName: "제목", flex: 2},
        {field: "createMember", headerName: "생성자", flex: 2},
        {
            field: "createDateTime",
            headerName: "생성일",
            flex: 2,
            valueFormatter: CommonUtil.dateFormat,
        },
    ];

    return (
        <>
            <BaseTitle title={"MyWorkspace"}/>
            <BaseSearch>
                <Button color={"success"} variant={"contained"} onClick={addWorkspace}>
                    추가
                </Button>
            </BaseSearch>
            <BaseTable
                rows={rows}
                total={total}
                columns={columns}
                pageable={pageable}
                loadRows={handlePageChange}
                onClick={handleRowClick}
            />
            <Dialog open={openDetail} onClose={handleClose}>
                <WorkspaceDetail handleClose={handleClose} data={rows.find(row => row.id === (openDetail ? rows[0]?.id : null))}/>
            </Dialog>
        </>
    );
};

export default WorkspaceList;
