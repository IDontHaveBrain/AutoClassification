import {Divider, Tab, Tabs} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {MenuInfo} from "service/commons/MenuItem";

interface SubTabBarProps {
    subTabMenu: MenuInfo[];
}

const SubTabBar = ({ subTabMenu }: SubTabBarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleChange = (event, newValue: string) => {
        navigate(newValue);
    };

    return (
        <Tabs
            value={location.pathname}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
                borderBottom: '1px solid #e8e8e8',
                borderRight: '2px solid #e8e8e8',
            }}
        >
            {subTabMenu?.map((tab, index) => (
                <>
                    <Tab key={index} label={tab?.name} value={tab?.path ?? ''} />
                    {index !== subTabMenu.length && <Divider orientation="vertical" flexItem />}
                </>
            ))}
            <Divider />
        </Tabs>
    );
};

export default SubTabBar;