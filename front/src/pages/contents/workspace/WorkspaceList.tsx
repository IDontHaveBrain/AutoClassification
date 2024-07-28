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
    createMember: string;
    name: string;
    description: string;
}

const WorkspaceList: React.FC = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({createMember: "", name: "", description: ""});
    const [openDetail, setOpenDetail] = useState(false);
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
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
                        name="createMember"
                        label="Creator"
                        variant="outlined"
                        size="small"
                        value={search.createMember}
                        onChange={handleSearchChange}
                    />
                    <TextField
                        name="description"
                        label="Description"
                        variant="outlined"
                        size="small"
                        value={search.description}
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
            <Dialog open={openDetail} onClose={handleClose}>
                <WorkspaceDetail handleClose={handleClose} data={rows.find(row => row.id === (openDetail ? rows[0]?.id : null))}/>
            </Dialog>
        </>
    );
};

export default WorkspaceList;
