import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridColTypeDef} from "@mui/x-data-grid";
import {DataGridProps} from "@mui/x-data-grid/models/props/DataGridProps";
import {GridBaseColDef} from "@mui/x-data-grid/internals";
import CONSTANT from "utils/constant/constant";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {GridSortModel} from "@mui/x-data-grid/models/gridSortModel";
import {initPageable, Pageable} from "model/GlobalModel";
import Button from "@mui/material/Button";
import {GridPaginationModel} from "@mui/x-data-grid/models/gridPaginationProps";

export interface CustomDataGridProps extends DataGridProps {

}

interface Props {
    columns: GridColDef[];
    page?: Pageable;
    loadRows?: any;
    onClick?: any;
    props?: DataGridProps;
    children?: React.ReactNode;
}

const BaseTable = ({columns, loadRows, onClick, props, children}: Props, ref) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(2);
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }]);
    const [rows, setRows] = useState<any>([]);


    const onCustomClick = (row: any) => {
        console.log('row Click! : ', row);
        if (onClick) {
            onClick(row);
        }
    }

    const handlePageChange = async (param: GridPaginationModel) => {
        const newPage = param.page;
        const newPageSize = param.pageSize;
        setPage(newPage);
        setPageSize(newPageSize);
        const newRows = await loadRows(newPage, newPageSize, sortModel);
        setRows(newRows);
    };

    const handleSortChange = async (model: GridSortModel) => {
        setSortModel(model);
        const newRows = await loadRows(page, pageSize, model);
        setRows(newRows);
    };

    useEffect(() => {
        const fetchRows = async () => {
            const initialRows = await loadRows(page, pageSize, sortModel);
            setRows(initialRows);
        };
        fetchRows();
    }, [loadRows, page, pageSize, sortModel]);

    useImperativeHandle(ref, () => ({
    }));

    return (
        <Box>
            <DataGrid rows={rows} columns={columns} {...props}
                      initialState={{
                          pagination: {
                              paginationModel: { page: 0, pageSize: 2 },
                          },
                          sorting: {
                              sortModel: [{ field: 'id', sort: 'asc' }] }
                      }}
                      rowCount={3}
                      pageSizeOptions={[2]}
                      pagination={true}
                      paginationMode={'server'}
                      onRowClick={onCustomClick}
                      onPaginationModelChange={(page) => handlePageChange(page)}
                      onSortModelChange={(model) => handleSortChange(model)}
                      sortModel={sortModel}
            />
            {children}
        </Box>
    )
}

export default forwardRef(BaseTable);