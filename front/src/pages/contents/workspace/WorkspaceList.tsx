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
import { Dialog, CircularProgress, TextField, Box } from "@mui/material";
import WorkspaceDetail from "pages/contents/workspace/WorkspaceDetail";
import { getMyWorkspaceList } from "service/Apis/WorkspaceApi";
import { WorkspaceContext } from "utils/ContextManager";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

interface Search {
    ownerEmail: string;
    name: string;
}

const WorkspaceList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({ownerEmail: "", name: ""});
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
            const params = {...search, page, size, sort};
            const res = await getMyWorkspaceList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (error) {
            console.error(error);
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
        setPageable(prevPageable => ({...prevPageable, page, size, sort}));
        fetchWorkspaces(page, size, sort, search);
    }

    const addWorkspace = () => {
        navigate("/workspace/editor");
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
        setPageable(prevPageable => ({...prevPageable, page: 0})); // 검색 시 첫 페이지로 이동
        fetchWorkspaces(0, pageable.size, pageable.sort, search);
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
        <>
            <BaseTitle title={"MyWorkspace"}/>
            <BaseSearch>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        name="name"
                        label="Workspace Name"
                        variant="outlined"
                        size="small"
                        value={search.name}
                        onChange={handleSearchChange}
                    />
                    <TextField
                        name="ownerEmail"
                        label="OwnerEmail"
                        variant="outlined"
                        size="small"
                        value={search.ownerEmail}
                        onChange={handleSearchChange}
                    />
                    <Button variant="contained" onClick={handleSearch}>Search</Button>
                </Box>
                <Button color={"success"} variant={"contained"} onClick={addWorkspace}>
                    추가
                </Button>
            </BaseSearch>
            {loading ? (
                <CircularProgress />
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
            <Dialog open={openDetail} onClose={handleClose} maxWidth="md" fullWidth>
                {selectedWorkspace && (
                    <WorkspaceDetail
                        handleClose={handleClose}
                        data={selectedWorkspace}
                        onDeleteSuccess={handleDeleteSuccess}
                    />
                )}
            </Dialog>
        </>
    );
};

export default WorkspaceList;
