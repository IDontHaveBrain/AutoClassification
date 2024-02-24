import { useEffect, useState } from "react";
import { getNoticeList } from "service/NoticeApi";
import Box from "@mui/material/Box";
import BaseTitle from "component/baseBoard/BaseTitle";
import BaseSearch from "component/baseBoard/BaseSearch";
import Button from "@mui/material/Button";
import { Divider } from "@mui/material";
import BaseField from "component/BaseField";
import BaseTable from "component/baseBoard/BaseTable";
import { NoticeModel } from "model/GlobalModel";
import { GridColDef } from "@mui/x-data-grid";

const NoticeList = () => {
    const [search, setSearch] = useState({
        writer: "",
        title: "",
    });
    const [noticeList, setNoticeList] = useState<NoticeModel[]>([]);

    const handleSearch = (e) => {
        setSearch({
            ...search,
            [e.target.name]: e.target.value,
        });
    };

    const rows = [
        { id: 1, title: "Snow", firstName: "Jon", age: 35 },
        { id: 2, title: "Lannister", firstName: "Cersei", age: 42 },
        { id: 3, title: "Lannister", firstName: "Jaime", age: 45 },
    ];

    useEffect(() => {
        getNoticeList(search)
            .then((response) => {
                console.log(response);
                setNoticeList(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "title", headerName: "제목", width: 130 },
        { field: "writer", headerName: "작성자", width: 130 },
        { field: "createdAt", headerName: "작성일", width: 130 },
    ];

    return (
        <Box>
            <BaseTitle title={"공지사항"} />
            <BaseSearch>
                <Box>
                    <BaseField
                        value={search.writer}
                        onChange={handleSearch}
                        size={"small"}
                        label={"작성자"}
                    />
                    <BaseField
                        value={search.title}
                        onChange={handleSearch}
                        size={"small"}
                        label={"제목"}
                    />
                    <Button variant={"contained"}>검색</Button>
                </Box>
                <Button color={"success"} variant={"contained"}>
                    작성하기
                </Button>
            </BaseSearch>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <BaseTable columns={columns} rows={rows} />
        </Box>
    );
};

export default NoticeList;
