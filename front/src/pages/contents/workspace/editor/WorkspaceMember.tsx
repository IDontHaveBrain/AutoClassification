import { Fragment, useContext } from "react";
import { WorkspaceContext } from "utils/ContextManager";
import ExpandComp from "component/ExpandComp";
import { WorkspaceModel } from "model/WorkspaceModel";
import { Box, Divider, List, ListItem, ListItemText } from "@mui/material";

interface Props {
    workspace: WorkspaceModel;
}

const WorkspaceMember = ({ workspace }: Props) => {
    const { state, setState } = useContext(WorkspaceContext);

    return (
        <ExpandComp title="Members">
            <List>
                {workspace?.members?.map((member, index) => (
                    <Fragment key={index}>
                        <ListItem>
                            <Box
                                borderLeft={2}
                                borderRight={2}
                                borderTop={2}
                                borderBottom={2}
                                borderColor="divider"
                                padding={1}
                            >
                                <ListItemText
                                    primary={member.name}
                                    secondary={member.email}
                                />
                            </Box>
                        </ListItem>
                    </Fragment>
                ))}
            </List>
        </ExpandComp>
    );
};

export default WorkspaceMember;
