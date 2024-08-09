import React, { useEffect, useState } from "react";
import { getMyWorkspaceList, getWorkspace } from "service/Apis/WorkspaceApi";
import { WorkspaceModel } from "model/WorkspaceModel";
import { Autocomplete, Button, TextField, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import BaseTitle from "component/baseBoard/BaseTitle";
import { onAlert } from "component/modal/AlertModal";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import { Strings } from "utils/strings";
import LabelledImages from "component/imgs/LabelledImages";
import { requestAutoLabel } from "service/Apis/TrainApi";

const AutoLabel: React.FC = () => {
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getMyWorkspaceList({size: 100})
            .then(res => {
                setWorkspaceList(res.data.content);
            })
            .catch(err => {
                console.error(err);
                onAlert(Strings.Common.apiFailed);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSelectChange = (e: React.ChangeEvent<{}>, newValue: WorkspaceModel | null) => {
        if (newValue) {
            setIsLoading(true);
            getWorkspace(newValue.id)
                .then(res => {
                    setSelected(res.data);
                })
                .catch(err => {
                    console.error(err);
                    onAlert(Strings.Common.apiFailed);
                })
                .finally(() => setIsLoading(false));
        } else {
            setSelected(null);
        }
    };

    const handleLabelingRequest = () => {
        if (!selected) {
            onAlert('Select Workspace');
            return;
        }
        if (!selected.files || selected.files.length === 0) {
            onAlert('No images to label');
            return;
        }

        setIsLoading(true);
        requestAutoLabel(selected.id)
            .then(() => {
                onAlert(Strings.Common.apiSuccess);
            })
            .catch(err => {
                console.error(err);
                onAlert(Strings.Common.apiFailed);
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <BaseTitle title={'AutoLabel'}/>
            <Grid container direction="column" spacing={3}>
                <Grid item container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                            options={workspaceList}
                            getOptionLabel={(option) => option.name}
                            value={selected}
                            onChange={handleSelectChange}
                            renderInput={(params) => <TextField {...params} label="Workspace" variant="outlined"/>}
                            disabled={isLoading}
                        />
                    </Grid>
                    <Grid item>
                        <Button 
                            onClick={handleLabelingRequest} 
                            variant="contained" 
                            color="primary"
                            disabled={!selected || isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : "Labeling Request"}
                        </Button>
                    </Grid>
                </Grid>
                {selected && (
                    <Grid item container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Workspace Data</Typography>
                            <WorkspaceDataSet 
                                imgs={selected.files || []} 
                                setState={setSelected}
                                isLoading={isLoading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Labelled Images</Typography>
                            <LabelledImages files={selected.files || []}/>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}

export default AutoLabel;
