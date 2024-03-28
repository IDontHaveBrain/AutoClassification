import {useCallback, useEffect, useRef, useState} from "react";
import { initPageable, Member, Pageable } from "model/GlobalModel";
import { getMemberList } from "service/Apis/MemberApi";
import { onAlert } from "component/modal/AlertModal";
import { GridColDef } from "@mui/x-data-grid";
import BaseTable from "component/baseBoard/BaseTable";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { debounce } from "lodash";
import {CommonUtil} from "utils/CommonUtil";

interface Props {
    close: () => void;
    setData: any;
}

const MemberSearchModal = ({ close, setData }: Props) => {
    const [search, setSearch] = useState({ email: "" });
    const [pageable, setPageable] = useState<Pageable>(initPageable(10));
    const [members, setMembers] = useState<Member[]>([]);
    const [totalMembers, setTotalMembers] = useState(0);

    const handleSearch = (e) => {
        setSearch({...search, [e.target.name]: e.target.value});
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "email", headerName: "Email", width: 130 },
        { field: "name", headerName: "Name", width: 130 },
    ];

    const handleRowClick = (data) => {
        setData(data.row);
        close();
    };

    const loadRows = useCallback((page, size, sort) => {
        const params = { ...search, page, size, sort };
        setPageable(params);

        getMemberList(params)
            .then((response) => {
                setMembers(response.data.content || []);
                setTotalMembers(response.data.totalElements);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [search]);

    useEffect(() => {
        loadRows(pageable.page, pageable.size, pageable.sort);
    }, [loadRows, pageable.page, pageable.size, pageable.sort]);

    return (
        <>
            <DialogTitle>Member Search</DialogTitle>
            <DialogContent>
                <TextField
                    label="Email"
                    variant="outlined"
                    name="email"
                    defaultValue={search.email}
                    onChange={handleSearch}
                    fullWidth
                />
                <BaseTable
                    rows={members}
                    total={totalMembers}
                    columns={columns}
                    pageable={pageable}
                    loadRows={loadRows}
                    onClick={handleRowClick}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Close</Button>
            </DialogActions>
        </>
    );
};

export default MemberSearchModal;