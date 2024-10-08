import React from "react";
import ExpandComp from "component/ExpandComp";
import { WorkspaceModel } from "model/WorkspaceModel";
import { Avatar, Box, Grid, IconButton, Tooltip, Typography, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Member } from "model/GlobalModel";

interface Props {
    workspace: WorkspaceModel;
    removeMember: (member: Member) => void;
    isLoading?: boolean;
    error?: string | null;
}

const WorkspaceMember: React.FC<Props> = ({ workspace, removeMember, isLoading = false, error = null }) => {
    if (isLoading) {
        return (
            <ExpandComp title="Members">
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            </ExpandComp>
        );
    }

    if (error) {
        return (
            <ExpandComp title="Members">
                <Typography color="error" align="center">{error}</Typography>
            </ExpandComp>
        );
    }

    return (
        <ExpandComp title="Members">
            <Grid container spacing={2}>
                {workspace?.members?.map((member, index) => (
                    <Grid item key={index} xs={6} sm={4} md={3} lg={2}>
                        <Tooltip title={`${member.name} (${member.email})`}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    position: 'relative',
                                }}
                            >
                                <Avatar
                                    sx={{ width: 60, height: 60, mb: 1 }}
                                    alt={member.name}
                                    src={`https://avatars.dicebear.com/api/initials/${member.name}.svg`}
                                />
                                <Typography variant="subtitle2" noWrap>
                                    {member.name}
                                </Typography>
                                {member.id !== workspace.owner.id && (
                                    <IconButton
                                        size="small"
                                        aria-label="delete"
                                        onClick={() => removeMember(member)}
                                        sx={{ position: 'absolute', top: 0, right: 0 }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </ExpandComp>
    );
};

export default WorkspaceMember;
