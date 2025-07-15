import {
  type GridSortDirection,
  type GridSortModel,
} from '@mui/x-data-grid/models/gridSortModel';
import dayjs from 'dayjs';

export const CommonUtil = {
  dateFormat: (params: { value: string | number | Date }) => {
    return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
  },
  convertSort(sortModel: GridSortModel): string {
    return sortModel
      .map((sortItem) => `${sortItem.field},${sortItem.sort}`)
      .join('&sort=');
  },
  convertSortModel: (sort: string): GridSortModel => {
    if (!sort) return [];
    return sort.split('&sort=').map((item) => {
      const [field, direction] = item.split(',');
      return { field, sort: direction as GridSortDirection };
    });
  },
};
