import { useCallback, useState } from "react";
import { getNoticeList } from "service/Apis/NoticeApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Dialog, Divider } from "@mui/material";
import BaseField from "component/BaseField";
import { initPageable, NoticeModel, Pageable } from "model/GlobalModel";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseTable from "component/baseBoard/BaseTable";
import NoticeDetail from "./NoticeDetail";
import { CommonUtil } from "utils/CommonUtil";
import { GridSortModel } from "@mui/x-data-grid/models/gridSortModel";

const NoticeList = () => {
  const [search, setSearch] = useState({ title: "", createMember: "" });
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [pageable, setPageable] = useState<Pageable>(initPageable(10));
  const [rows, setRows] = useState<NoticeModel[]>([]);

  const navigate = useNavigate();

  const handleClickOpen = () => setOpenDetail(true);
  const handleClose = () => setOpenDetail(false);

  const handleRowClick = (data) => {
    setSelectedData(data.row as NoticeModel);
    handleClickOpen();
  };

  const handleSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const onSearch = () => {
    loadRows(pageable.page, pageable.size, pageable.sort);
  };

  const loadRows = useCallback(
    (page, size, sort) => {
      const params = { ...search, page, size, sort };
      setPageable(params);

      getNoticeList(params)
        .then((response) => {
          setRows(response.data || []);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [search],
  );

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "title", headerName: "제목", flex: 2 },
    { field: "createMember", headerName: "작성자", flex: 2 },
    {
      field: "createDateTime",
      headerName: "작성일",
      flex: 2,
      valueFormatter: CommonUtil.dateFormat,
    },
    { field: "updateMember", headerName: "수정자", flex: 2 },
    {
      field: "updateDateTime",
      headerName: "수정일",
      flex: 2,
      valueFormatter: CommonUtil.dateFormat,
    },
  ];

  const onClickWrite = () => navigate("/notice/write");

  return (
    <Box>
      <BaseTitle title={"공지사항"} />
      <BaseSearch>
        <Box>
          <BaseField
            name={"createMember"}
            value={search.createMember}
            onChange={handleSearch}
            size={"small"}
            label={"작성자"}
          />
          <BaseField
            name={"title"}
            value={search.title}
            onChange={handleSearch}
            size={"small"}
            label={"제목"}
          />
          <Button variant={"contained"} onClick={onSearch}>
            검색
          </Button>
        </Box>
        <Button color={"success"} variant={"contained"} onClick={onClickWrite}>
          작성하기
        </Button>
      </BaseSearch>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <BaseTable
        rows={rows}
        columns={columns}
        pageable={pageable}
        loadRows={loadRows}
        onClick={handleRowClick}
      />

      <Dialog open={openDetail} onClose={handleClose}>
        <NoticeDetail handleClose={handleClose} data={selectedData} />
      </Dialog>
    </Box>
  );
};

export default NoticeList;
