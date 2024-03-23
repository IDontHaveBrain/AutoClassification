import {useCallback, useContext, useEffect, useState} from "react";
import {WorkspaceModel} from "model/WorkspaceModel";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseTable from "component/baseBoard/BaseTable";
import {GridColDef} from "@mui/x-data-grid";
import {CommonUtil} from "utils/CommonUtil";
import {initPageable, Pageable} from "model/GlobalModel";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import {Dialog} from "@mui/material";
import WorkspaceDetail from "pages/contents/workspace/WorkspaceDetail";
import {getMyWorkspaceList} from "service/Apis/WorkspaceApi";
import {WorkspaceContext} from "utils/ContextManager";

interface Search {
    createMember: string;
}

interface State {
    workspaceList?: WorkspaceModel[];
    workspace?: WorkspaceModel;
}

const WorkspaceList = () => {
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [search, setSearch] = useState<Search>({createMember: ""});
    const [openDetail, setOpenDetail] = useState(false);
    const navigate = useNavigate();
    const {state, setState} = useContext(WorkspaceContext);

    const fetchWorkspaces = useCallback(async (page, size, sort, search) => {
        try {
            const params = {...search, page, size, sort};
            const res = await getMyWorkspaceList(params);
            setState(prevState => ({...prevState, rows: res.data.content, total: res.data.totalElements}));
        } catch (error) {
            console.error(error);
        }
    }, [setState]);

    useEffect(() => {
        fetchWorkspaces(pageable.page, pageable.size, pageable.sort, search);
    }, [fetchWorkspaces, pageable, search]);

    const handlePageChange = (page, size, sort) => {
        setState(prevState => ({...prevState, pageable: {...pageable, page, size, sort}}));
        fetchWorkspaces(page, size, sort, search);
    }

    const addWorkspace = () => {
        navigate("/workspace/editor");
    };

    const handleClickOpen = () => setOpenDetail(true);
    const handleClose = () => setOpenDetail(false);
    const handleRowClick = (data) => {
        setState((prevState) => ({
            ...prevState,
            selectedData: data.row as WorkspaceModel,
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
                rows={state?.rows || []}
                total={state?.total || 0}
                columns={columns}
                pageable={pageable}
                loadRows={handlePageChange}
                onClick={handleRowClick}
            ></BaseTable>
            <Dialog open={openDetail} onClose={handleClose}>
                <WorkspaceDetail handleClose={handleClose} data={state?.selectedData}/>
            </Dialog>
        </>
    );
};

export default WorkspaceList;
