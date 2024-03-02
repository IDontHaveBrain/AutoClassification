import { useEffect, useState } from "react";
import { getNoticeList } from "service/NoticeApi";
import Box from "@mui/material/Box";
import BaseTitle from "../../../component/baseBoard/BaseTitle";
import BaseSearch from "../../../component/baseBoard/BaseSearch";
import Button from "@mui/material/Button";
import { Divider } from "@mui/material";
import BaseField from "component/BaseField";
import BaseTable from "../../../component/baseBoard/BaseTable";
import { NoticeModel } from "model/GlobalModel";
import { GridColDef } from "@mui/x-data-grid";
import {useNavigate, useNavigation} from "react-router-dom";
import {GridSortModel} from "@mui/x-data-grid/models/gridSortModel";
import qs from "qs";

const NoticeList = () => {
    const [search, setSearch] = useState({
        title: "",
        createMember: "",
    });
    const [noticeList, setNoticeList] = useState<NoticeModel[]>([]);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        setSearch({
            ...search,
            [e.target.name]: e.target.value,
        });
    };

    const onSearch = (e) => {
        const params = {
            search: {title: search.title, createMember: search.createMember},
        }

        getNoticeList(params)
            .then((response) => {
                console.log(response);
                setNoticeList(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const loadRows = async (page: number, pageSize: number, sortModel: GridSortModel) => {
        const params = {
            title: search.title,
            createMember: search.createMember,
            page: page,
            size: pageSize,
        }

        const response = await getNoticeList(params);
        return response.data;
    }

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "title", headerName: "제목", width: 130 },
        { field: "createMember", headerName: "작성자", width: 130 },
        { field: "createDateTime", headerName: "작성일", width: 130 },
        { field: "updateMember", headerName: "수정자", width: 130 },
        { field: "updateDateTime", headerName: "수정일", width: 130 },
    ];

    const onClickWrite = () => {
        navigate("/notice/write");
    }

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
                    <Button variant={"contained"} onClick={onSearch}>검색</Button>
                </Box>
                <Button color={"success"} variant={"contained"} onClick={onClickWrite}>
                    작성하기
                </Button>
            </BaseSearch>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <BaseTable columns={columns} loadRows={loadRows} />
        </Box>
    );
};

export default NoticeList;
