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
  columns: GridColDef[];
  pageable: Pageable;
  loadRows: (page: number, pageSize: number, sort: string) => void;
  onClick?: (row: any) => void;
  props?: DataGridProps;
  children?: React.ReactNode;
}

const BaseTable = (
  { rows, columns, pageable, loadRows, onClick, props, children }: Props,
  ref,
) => {
  const [page, setPage] = useState(pageable.page);
  const [pageSize, setPageSize] = useState(pageable.size);
  const [sortModel, setSortModel] = useState<GridSortModel>(pageable.sort);

  useEffect(() => {
    const sort = CommonUtil.convertSort(sortModel);
    console.log("sort : ", sort);
    console.log("sortModel : ", sortModel);
    loadRows(page, pageSize, sort);
  }, [page, pageSize, sortModel]);

  const handlePageChange = (param: GridPaginationModel) => {
    setPage(param.page);
    setPageSize(param.pageSize);
  };

  const handleSortChange = (sort: GridSortModel) => {
    setSortModel(sort);
  };

  useImperativeHandle(ref, () => ({}));

  return (
    <Box>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        {...props}
        rowCount={rows.length}
        pageSizeOptions={[10, 25, 50]}
        pagination={true}
        paginationMode={"server"}
        paginationModel={{ page, pageSize }}
        onRowClick={onClick}
        onPaginationModelChange={handlePageChange}
        onSortModelChange={handleSortChange}
        // sortModel={sortModel}
      />
      {children}
    </Box>
  );
};

export default forwardRef(BaseTable);
