import { useCallback, useEffect, useState } from "react";
import { getMyWorkspaceList } from "service/Apis/WorkspaceApi";
import { Workspace } from "model/WorkspaceModel";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseField from "component/BaseField";
import BaseTable from "component/baseBoard/BaseTable";
import { GridColDef } from "@mui/x-data-grid";
import { CommonUtil } from "utils/CommonUtil";
import { initPageable, Pageable } from "model/GlobalModel";
import { GridSortModel } from "@mui/x-data-grid/models/gridSortModel";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import WorkspaceDetail from "pages/contents/workspace/WorkspaceDetail";
import { useSelector } from "react-redux";
import { usePageContext } from "component/PageContext";

interface Search {
  createMember: string;
}

interface State {
  workspaceList?: Workspace[];
  selectedData?: Workspace | null;
}

const WorkspaceList = () => {
  const [pageable, setPageable] = useState<Pageable>(initPageable(10));
  const [search, setSearch] = useState<Search>({ createMember: "" });
  const [openDetail, setOpenDetail] = useState(false);
  const { pageState, setPageState } = usePageContext<State>();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const loadRows = useCallback(
    async (page: number, size: number, sort: any) => {
      const params = { ...search, page, size, sort };
      setPageable(params);

      getMyWorkspaceList(params)
        .then((response) => {
          setPageState(prevState => ({ ...prevState, workspaceList: response.data || [] }));
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [search, setPageState],
  );

  const addWorkspace = () => {
    navigate("/workspace/editor");
  };

  const handleClickOpen = () => setOpenDetail(true);
  const handleClose = () => setOpenDetail(false);
  const handleRowClick = (data) => {
    setPageState(prevState => ({ ...prevState, selectedData: data.row as Workspace }));
    handleClickOpen();
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "제목", flex: 2 },
    { field: "createMember", headerName: "생성자", flex: 2 },
    {
      field: "createDateTime",
      headerName: "생성일",
      flex: 2,
      valueFormatter: CommonUtil.dateFormat,
    },
  ];

  return (
    <>
      <BaseTitle title={"MyWorkspace"} />
      <BaseSearch>
        <Button color={"success"} variant={"contained"} onClick={addWorkspace}>
          추가
        </Button>
      </BaseSearch>
      <BaseTable
        rows={pageState?.workspaceList}
        total={pageState?.workspaceList?.length || 0}
        columns={columns}
        pageable={pageable}
        loadRows={loadRows}
        onClick={handleRowClick}
      ></BaseTable>
      <Dialog open={openDetail} onClose={handleClose}>
        <WorkspaceDetail handleClose={handleClose} data={pageState?.selectedData} />
      </Dialog>
    </>
  );
};

export default WorkspaceList;