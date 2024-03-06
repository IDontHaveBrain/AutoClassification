import dayjs from "dayjs";
import {
  GridSortDirection,
  GridSortItem,
  GridSortModel,
} from "@mui/x-data-grid/models/gridSortModel";

export const CommonUtil = {
  dateFormat: (params) => {
    return dayjs(params.value).format("YYYY-MM-DD HH:mm:ss");
  },
  convertSort(sortModel: GridSortModel): string {
    return sortModel
      .map((sortItem) => {
        return `${sortItem.field},${sortItem.sort}`;
      })
      .join("&");
  },
  convertSortModel: (sort: string[]): GridSortModel => {
    return sort.flatMap((sortItem) => {
      if (typeof sortItem === "string") {
        const [field, sort] = sortItem.split(",");
        return { field, sort: sort as GridSortDirection };
      }
      return [];
    });
  },
};
