import dayjs from "dayjs";
import {
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid/models/gridSortModel";

export const CommonUtil = {
  dateFormat: (params) => {
    return dayjs(params.value).format("YYYY-MM-DD HH:mm:ss");
  },
  convertSort: (sortModel: GridSortModel): string => {
    return sortModel
      .map((sortItem) => `${sortItem.field},${sortItem.sort}`)
      .join(",");
  },
  convertSortModel: (sort: string): GridSortModel => {
    return sort.split(",").map((sortItem) => {
      const [field, sort] = sortItem.split(",");
      return { field, sort: sort as GridSortDirection };
    });
  },
};
