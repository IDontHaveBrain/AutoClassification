import { Fragment, useContext } from "react";
import { WorkspaceContext } from "utils/ContextManager";
import ExpandComp from "component/ExpandComp";
import { WorkspaceModel } from "model/WorkspaceModel";
import {Box, Divider, Grid, IconButton, ListItem, ListItemText} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    workspace: WorkspaceModel;
    removeMember: any;
}

const WorkspaceMember = ({ workspace, removeMember }: Props) => {

    return (
        <ExpandComp title="Members">
            <Grid container spacing={2}>
                {workspace?.members?.map((member, index) => (
                    <Fragment key={index}>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <Box
                                borderLeft={2}
                                borderRight={2}
                                borderTop={2}
                                borderBottom={2}
                                borderColor="divider"
                                padding={1}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <ListItemText
                                    primary={member.name}
                                    secondary={member.email}
                                />
                                <IconButton edge="end" aria-label="delete" onClick={() => removeMember(member)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Fragment>
                ))}
            </Grid>
        </ExpandComp>
    );
};

export default WorkspaceMember;