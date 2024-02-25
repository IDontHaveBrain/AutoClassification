import { Link as RouterLink } from 'react-router-dom';
import {Breadcrumbs, Link, SxProps, Typography} from '@mui/material';
import {MenuInfo} from "service/commons/MenuItem";

type Props = {
    path: MenuInfo[];
    sx?: SxProps;
};

const ContentPath = ({ path, sx }: Props) => {
    return (
        <Breadcrumbs aria-label="breadcrumb" sx={sx}>
            {path.map((menu, index) => {
                const isLast = index === path.length - 1;
                const textStyle = { fontSize: '0.875rem' };

                if (!menu.path) {
                    return <Typography color="textPrimary" sx={textStyle} key={menu.name}>{menu.name}</Typography>
                } else {
                    return <Link color="inherit" component={RouterLink} to={menu.path || ''} key={menu.name} sx={textStyle}>{menu.name}</Link>
                }
            })}
        </Breadcrumbs>
    );
};

export default ContentPath;