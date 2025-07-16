import { type ReactNode } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Grid, type Theme } from '@mui/material';
import { green } from '@mui/material/colors';
import { type SxProps } from '@mui/system';

interface ExpandCompProps {
    children: ReactNode;
    title: string;
    titleStyle?: SxProps<Theme>;
    contentStyle?: SxProps<Theme>;
}

const ExpandComp = ({ children, title, titleStyle, contentStyle }: ExpandCompProps) => (
    <Grid size={{ md: 12 }}>
        <Accordion sx={titleStyle ? titleStyle : { border: '2px solid #c4c4c4' }}>
            <AccordionSummary sx={{ bgcolor: green[300] }} expandIcon={<ExpandMoreIcon />}>
                {title}
            </AccordionSummary>
            <AccordionDetails sx={contentStyle ? contentStyle : null}>
                {children}
            </AccordionDetails>
        </Accordion>
    </Grid>
);

export default ExpandComp;