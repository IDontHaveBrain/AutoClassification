import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridColTypeDef} from "@mui/x-data-grid";
import {DataGridProps} from "@mui/x-data-grid/models/props/DataGridProps";
import {GridBaseColDef} from "@mui/x-data-grid/internals";

export interface CustomDataGridProps extends DataGridProps {

}

interface Props {
    rows: any[];
    columns: GridColDef[];
    page?: number;
    size?: number;
    onClick?: any;
    props?: DataGridProps;
    children?: React.ReactNode;
}

const BaseTable = ({rows, columns, props, onClick, children}: Props) => {

    const onCustomClick = (row: any) => {
        console.log(row);
        if (onClick) {
            onClick(row);
        }
    }

    return (
        <Box>
            <DataGrid rows={rows} columns={columns} {...props}
                      initialState={{
                          pagination: {
                              paginationModel: { page: 0, pageSize: 10 },
                          },
                      }}
                      pageSizeOptions={[10, 25, 50]}
                      onRowClick={onCustomClick}
            />
        </Box>
    )
}

export default BaseTable;