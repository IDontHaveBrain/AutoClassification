import React, { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef, GridRowParams, GridSortModel, GridRenderCellParams } from "@mui/x-data-grid";
import { DataGridProps } from "@mui/x-data-grid/models/props/DataGridProps";
import { GridPaginationModel } from "@mui/x-data-grid/models/gridPaginationProps";
import { Pageable } from "model/GlobalModel";
import { CommonUtil } from "utils/CommonUtil";
import Tooltip from "@mui/material/Tooltip";

interface BaseTableProps {
  rows: any[];
  total: number;
  columns: GridColDef[];
  pageable: Pageable;
  loadRows: (page: number, pageSize: number, sortModel: string) => void;
  onClick?: (params: GridRowParams) => void;
  dataGridProps?: Omit<DataGridProps, 'rows' | 'columns' | 'paginationModel' | 'onPaginationModelChange' | 'onSortModelChange' | 'onRowClick'>;
  children?: React.ReactNode;
  getTooltipContent?: (row: any) => string;
  getExpandedContent?: (row: any) => React.ReactNode;
}

const BaseTable = React.forwardRef<HTMLDivElement, BaseTableProps>(({ 
  rows = [], 
  total, 
  columns, 
  pageable, 
  loadRows, 
  onClick, 
  dataGridProps, 
  children,
  getTooltipContent
}, ref) => {
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const handlePageChange = useCallback((param: GridPaginationModel) => {
    loadRows(param.page, param.pageSize, CommonUtil.convertSort(sortModel));
  }, [loadRows, sortModel]);

  const handleSortChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
    loadRows(pageable.page, pageable.size, CommonUtil.convertSort(newSortModel));
  }, [loadRows, pageable.page, pageable.size]);

  const paginationModel = useMemo(() => ({
    page: pageable.page,
    pageSize: pageable.size,
  }), [pageable.page, pageable.size]);

  const enhancedColumns: GridColDef[] = useMemo(() => columns.map(column => ({
    ...column,
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip title={getTooltipContent ? getTooltipContent(params.row) : ''} arrow>
        <div>{column.renderCell ? column.renderCell(params) : params.value}</div>
      </Tooltip>
    ),
  })), [columns, getTooltipContent]);

  return (
    <Box sx={{ mt: 2 }} ref={ref}>
      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        autoHeight
        rowCount={total}
        pageSizeOptions={[10, 25, 50]}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePageChange}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        onRowClick={onClick}
        disableColumnMenu
        disableColumnSelector
        {...dataGridProps}
      />
      {children}
    </Box>
  );
});

BaseTable.displayName = 'BaseTable';

export default BaseTable;
