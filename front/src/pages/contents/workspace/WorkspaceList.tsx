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

interface Search {
  createMember: string;
}

const WorkspaceList = () => {
  const [pageable, setPageable] = useState<Pageable>(initPageable(10));
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [search, setSearch] = useState<Search>({ createMember: "" });
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const loadRows = useCallback(
    async (page: number, size: number, sort: any) => {
      const params = { ...search, page, size, sort };
      setPageable(params);

      getMyWorkspaceList(params)
        .then((response) => {
          setWorkspaceList(response.data || []);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [search],
  );

  const addWorkspace = () => {
    console.log("addWorkspace");
    navigate("/workspace/editor");
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
        <BaseField
          name={"createMember"}
          value={search.createMember}
          onChange={handleSearch}
          size={"small"}
          label={"작성자"}
        />
        <Button color={"success"} variant={"contained"} onClick={addWorkspace}>
          추가
        </Button>
      </BaseSearch>
      <BaseTable
        rows={workspaceList}
        columns={columns}
        pageable={pageable}
        loadRows={loadRows}
      ></BaseTable>
    </>
  );
};

export default WorkspaceList;
