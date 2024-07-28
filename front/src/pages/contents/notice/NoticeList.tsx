import React, { useCallback, useEffect, useState } from "react";
import { getNoticeList } from "service/Apis/NoticeApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Dialog, Divider } from "@mui/material";
import BaseField from "component/BaseField";
import { initPageable, NoticeModel, Pageable, SseEvent, SseType } from "model/GlobalModel";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseTable from "component/baseBoard/BaseTable";
import NoticeDetail from "./NoticeDetail";
import { CommonUtil } from "utils/CommonUtil";
import { eventBus } from "layouts/BackGround";

const NoticeList: React.FC = () => {
    const [search, setSearch] = useState({ title: "", createMember: "" });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedData, setSelectedData] = useState<NoticeModel>();
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [rows, setRows] = useState<NoticeModel[]>([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchNotices = useCallback(async (page, size, sort, search) => {
        try {
            const params = { ...search, page, size, sort };
            const res = await getNoticeList(params);
            setRows(res.data.content);
            setTotal(res.data.totalElements);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchNotices(pageable.page, pageable.size, pageable.sort, search);

        const handleNoticeUpdate = () => {
            fetchNotices(pageable.page, pageable.size, pageable.sort, search);
        };

        eventBus.subscribe(SseType.NOTICE_UPDATE, handleNoticeUpdate);

        return () => {
            eventBus.unsubscribe(SseType.NOTICE_UPDATE, handleNoticeUpdate);
        };
    }, [fetchNotices, pageable, search]);

    const handlePageChange = (page, size, sort) => {
        setPageable({ ...pageable, page, size, sort });
        fetchNotices(page, size, sort, search);
    }

    const handleRowClick = (data) => {
        setSelectedData(data.row as NoticeModel);
        handleClickOpen();
    }

    const handleClickOpen = () => {
        setOpenDetail(true);
    };

    const handleClose = () => {
        setOpenDetail(false);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const onSearch = () => {
        fetchNotices(pageable.page, pageable.size, pageable.sort, search);
    };

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
                total={total}
                columns={columns}
                pageable={pageable}
                loadRows={handlePageChange}
                onClick={handleRowClick}
            />

            <Dialog open={openDetail} onClose={handleClose}>
                <NoticeDetail handleClose={handleClose} data={selectedData} />
            </Dialog>
        </Box>
    );
};

export default NoticeList;
