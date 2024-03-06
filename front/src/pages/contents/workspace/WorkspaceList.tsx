import { useEffect, useState } from "react";
import { getMyWorkspaceList } from "../../../service/Apis/WorkspaceApi";
import { Workspace } from "model/WorkspaceModel";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseField from "component/BaseField";
import BaseTable from "../../../component/baseBoard/BaseTable";
import { GridColDef } from "@mui/x-data-grid";
import { CommonUtil } from "../../../utils/CommonUtil";
import { initPageable, Pageable } from "../../../model/GlobalModel";
import { GridSortModel } from "@mui/x-data-grid/models/gridSortModel";

const WorkspaceList = () => {
  const [pageable, setPageable] = useState<Pageable>(initPageable(10));
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);

  const loadRows = async (page: number, pageSize: number, sort: GridSortModel) => {
    const params = {
      page: page,
      pageSize: pageSize,
      sort: sort,
    };

    const response = await getMyWorkspaceList(params);
    return response.data;
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
          // value={search.createMember}
          // onChange={handleSearch}
          size={"small"}
          label={"작성자"}
        />
      </BaseSearch>
      <BaseTable columns={columns} pageable={pageable} loadRows={loadRows}></BaseTable>
    </>
  );
};

export default WorkspaceList;
