import React, { useCallback, useEffect, useState } from "react";
import { getNoticeList } from "service/Apis/NoticeApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Dialog, Divider, CircularProgress, TextField } from "@mui/material";
import { initPageable, NoticeModel, Pageable, SseType } from "model/GlobalModel";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import BaseTable from "component/baseBoard/BaseTable";
import NoticeDetail from "./NoticeDetail";
import { CommonUtil } from "utils/CommonUtil";
import { eventBus } from "layouts/BackGround";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

interface SearchParams {
    title: string;
    createMember: string;
    content: string;
}

const NoticeList: React.FC = () => {
    const [search, setSearch] = useState<SearchParams>({ title: "", createMember: "", content: "" });
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedData, setSelectedData] = useState<NoticeModel | undefined>();
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [rows, setRows] = useState<NoticeModel[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotices = useCallback(async (page: number, size: number, sort: string, searchParams: SearchParams) => {
        setLoading(true);
        try {
            const params = { ...searchParams, page, size, sort };
            const res = await getNoticeList(params);
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
        fetchNotices(pageable.page, pageable.size, pageable.sort, search);

        const handleNoticeUpdate = () => {
            fetchNotices(pageable.page, pageable.size, pageable.sort, search);
        };

        eventBus.subscribe(SseType.NOTICE_UPDATE, handleNoticeUpdate);

        return () => {
            eventBus.unsubscribe(SseType.NOTICE_UPDATE, handleNoticeUpdate);
        };
    }, [fetchNotices, pageable, search]);

    const handlePageChange = (page: number, size: number, sort: string) => {
        setPageable(prevPageable => ({ ...prevPageable, page, size, sort }));
        fetchNotices(page, size, sort, search);
    }

    const handleRowClick = (params: GridRowParams) => {
        setSelectedData(params.row as NoticeModel);
        setOpenDetail(true);
    }

    const handleClose = () => {
        setOpenDetail(false);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prevSearch => ({ ...prevSearch, [e.target.name]: e.target.value }));
    };

    const onSearch = () => {
        fetchNotices(0, pageable.size, pageable.sort, search);
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

    const getTooltipContent = (row: NoticeModel) => {
        return `Title: ${row.title}\nCreated by: ${row.createMember}\nCreated at: ${CommonUtil.dateFormat({ value: row.createDateTime })}\nUpdated by: ${row.updateMember}\nUpdated at: ${CommonUtil.dateFormat({ value: row.updateDateTime })}`;
    };

    const getExpandedContent = (row: NoticeModel) => {
        return (
            <Box sx={{ p: 2 }}>
                <p><strong>Content:</strong> {row.content}</p>
            </Box>
        );
    };

    return (
        <Box>
            <BaseTitle title={"공지사항"} />
            <BaseSearch>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        name="title"
                        label="Title"
                        variant="outlined"
                        size="small"
                        value={search.title}
                        onChange={handleSearch}
                    />
                    <TextField
                        name="createMember"
                        label="Creator"
                        variant="outlined"
                        size="small"
                        value={search.createMember}
                        onChange={handleSearch}
                    />
                    <TextField
                        name="content"
                        label="Content"
                        variant="outlined"
                        size="small"
                        value={search.content}
                        onChange={handleSearch}
                    />
                    <Button variant="contained" onClick={onSearch}>Search</Button>
                </Box>
                <Button color={"success"} variant={"contained"} onClick={onClickWrite}>
                    작성하기
                </Button>
            </BaseSearch>
            <Divider sx={{ mt: 2, mb: 2 }} />
            {loading ? (
                <CircularProgress />
            ) :
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
            }

            <Dialog open={openDetail} onClose={handleClose}>
                <NoticeDetail handleClose={handleClose} data={selectedData} />
            </Dialog>
        </Box>
    );
};

export default NoticeList;
