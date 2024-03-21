import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DataGridProps } from "@mui/x-data-grid/models/props/DataGridProps";
import { GridSortModel } from "@mui/x-data-grid/models/gridSortModel";
import { GridPaginationModel } from "@mui/x-data-grid/models/gridPaginationProps";
import { Pageable } from "model/GlobalModel";
import { CommonUtil } from "utils/CommonUtil";

interface Props {
  rows: any[];
  total: number;
  columns: GridColDef[];
  pageable: Pageable;
  loadRows: any;
  onClick?: (row: any) => void;
  props?: DataGridProps;
  children?: React.ReactNode;
}

const BaseTable = (
    { rows = [], total, columns, pageable, loadRows, onClick, props, children }: Props,
    ref,
) => {
  const [page, setPage] = useState(pageable.page);
  const [pageSize, setPageSize] = useState(pageable.size);
  const [sortModel, setSortModel] = useState(pageable.sort);

  const handlePageChange = (param: GridPaginationModel) => {
    setPage(param.page);
    setPageSize(param.pageSize);
    loadRows(param.page, param.pageSize, sortModel);
  };

  const handleSortChange = (sort: GridSortModel) => {
    console.log(sort);
    const sortModel = CommonUtil.convertSort(sort);
    setSortModel(sortModel);
    loadRows(page, pageSize, sortModel);
  };

  useImperativeHandle(ref, () => ({}));

  return (
      <Box sx={{ mt: 2 }}>
        <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            rowCount={total}
            pageSizeOptions={[10, 25, 50]}
            pagination
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePageChange}
            onSortModelChange={handleSortChange}
            onRowClick={onClick}
            {...props}
        />
        {children}
      </Box>
  );
};

export default forwardRef(BaseTable);