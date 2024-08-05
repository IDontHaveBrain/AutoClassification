import React from "react";
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import ExpandComp from "component/ExpandComp";
import { FileModel } from "model/GlobalModel";

interface Props {
    imgs: FileModel[];
    setState: React.Dispatch<React.SetStateAction<any>>;
    isLoading?: boolean;
    error?: string | null;
}

const WorkspaceDataSet: React.FC<Props> = ({ imgs, setState, isLoading = false, error = null }) => {
    if (isLoading) {
        return (
            <ExpandComp title="DataSet">
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            </ExpandComp>
        );
    }

    if (error) {
        return (
            <ExpandComp title="DataSet">
                <Typography color="error" align="center">{error}</Typography>
            </ExpandComp>
        );
    }

    return (
        <ExpandComp title="DataSet">
            {imgs.length === 0 ? (
                <Typography align="center">No images available</Typography>
            ) : (
                <Grid container spacing={2}>
                    {imgs.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={image.url}
                                    alt={image.fileName}
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        {image.originalFileName}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </ExpandComp>
    );
};

export default WorkspaceDataSet;
